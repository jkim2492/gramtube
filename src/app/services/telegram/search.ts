import { Injectable } from "@angular/core";
import { TelegramClient } from "@app/services/telegram/client";
import { Api } from "telegram";
import { Video, MessageLike, ChannelLike, Channel } from "@app/models/video.model";
import bigInt from "big-integer";
import { EntityLike } from "telegram/define";
import { ALBUM_LOOKAROUND } from "@src/config";
import { _BigInt, getHashtags, sleep, storeGet, storeSet } from "@src/core/utils";
import { getInputChannel } from "telegram/Utils";

@Injectable({
  providedIn: "root",
})
export class TelegramSearch {
  constructor(private client: TelegramClient) {}

  async getChannel(channelLike: ChannelLike): Promise<Channel> {
    if (channelLike instanceof Api.Channel) {
      return channelLike;
    }

    let input;
    if (channelLike instanceof Api.Message) {
      input = channelLike.peerId;
    } else if (typeof channelLike === "bigint" || typeof channelLike === "number") {
      input = bigInt(channelLike.toString());
      input = this.getInputChannel(input);
    } else if (channelLike.channelId) {
      input = bigInt(channelLike.channelId.toString());
      input = this.getInputChannel(input);
    } else if (channelLike instanceof Api.InputChannel) {
      input = channelLike;
    } else {
      console.error(channelLike);
      throw new Error("Could not find a suitable entity for channel");
    }

    const channel = await this.client.client.getEntity(input);
    const inputChannel = getInputChannel(channel);
    const storeKey = `channel/${channel.id.toString()}`;
    storeSet(storeKey, inputChannel.originalArgs);
    return channel as Api.Channel;
  }

  getInputChannel(channelId: bigInt.BigInteger) {
    const storeKey = `channel/${channelId.toString()}`;
    const args = storeGet(storeKey);
    return new Api.InputChannel(args);
  }

  async getMessage(messageLike: MessageLike): Promise<Api.Message> {
    if (messageLike instanceof Api.Message) {
      return messageLike;
    }
    const channel = await this.getChannel(messageLike);
    const messages = await this.client.client.getMessages(channel as EntityLike, {
      ids: messageLike.messageId,
    });
    const message = messages[0];
    return message;
  }

  async getVideo(messageLike: MessageLike): Promise<Video> {
    const message = await this.getMessage(messageLike);
    if (!Video.isVideoChannelMessage(message)) {
      console.error(message);
      throw new Error("Called getVideo with invalid message");
    }
    const channel = await this.getChannel(message);
    try {
      return new Video(message, channel);
    } catch (e) {
      console.error(e);
      console.error(message);
      throw new Error("Video not found");
    }
  }

  async *iterAlbum(message: Api.Message) {
    if (!message.groupedId) {
      yield message;
      return;
    }
    let messageIter = this.client.client.iterMessages(message.peerId, {
      minId: message.id - ALBUM_LOOKAROUND,
      maxId: message.id + ALBUM_LOOKAROUND,
    });
    for await (let element of messageIter) {
      if (!element.groupedId) {
        continue;
      }
      if (element.groupedId.equals(message.groupedId)) {
        yield element;
      }
    }
  }

  async *searchLocal(query: string) {
    let searchParams = {
      search: query,
    };
    let messageIter = this.client.client.iterMessages(undefined, searchParams);
    for await (let message of messageIter) {
      yield message;
    }
  }

  async *searchGlobal(query: string): AsyncGenerator<Api.Message> {
    query = query.startsWith("#") ? query.slice(1) : query;

    let offsetPeer = new Api.InputPeerEmpty();
    let offsetRate: number = 0;
    let offsetId: number = 0;
    const limit = 100;
    const waitTime = 1000;

    let request = new Api.channels.SearchPosts({
      offsetPeer,
      hashtag: query,
      offsetRate,
      limit,
    });

    let lastLoad = new Date().getTime() / 1000;
    let result = (await this.client.client.invoke(request)) as Api.messages.MessagesSlice;
    let messages = result.messages;

    for (let message of messages) {
      if (message instanceof Api.Message) {
        offsetPeer = message.peerId as any;
        offsetId = message.id;
        yield message;
      }
    }

    let messageCount = result.count;

    const iterCount = Math.ceil(messageCount / limit);
    for (let i = 0; i < iterCount; i++) {
      request.offsetId = offsetId;
      request.offsetRate = result.nextRate || 0;
      request.offsetPeer = offsetPeer;
      await sleep(waitTime - (new Date().getTime() - lastLoad));
      lastLoad = new Date().getTime() / 1000;
      result = (await this.client.client.invoke(request)) as Api.messages.MessagesSlice;
      messages = result.messages;
      if (result.messages.length === 0) {
        return;
      }

      for (let message of messages) {
        if (message instanceof Api.Message) {
          offsetPeer = message.peerId as any;
          offsetId = message.id;
          yield message;
        }
      }
    }
  }

  async *searchChannel(channel: Channel | undefined, offsetId?: number): AsyncGenerator<Video> {
    const target = channel || "me";
    let searchParams = {
      offsetId: offsetId,
      filter: new Api.InputMessagesFilterVideo(),
    };
    let messageIter = this.client.client.iterMessages(target as EntityLike, searchParams);
    for await (let message of messageIter) {
      if (Video.isVideoChannelMessage(message)) {
        const video = await this.getVideo(message);
        yield video;
      }
    }
  }

  async *search(query: string, category: string | null, signal?: AbortSignal) {
    await this.client.client.connect();
    let messageIter;

    if (category == "My Chats" || !category) {
      messageIter = this.searchLocal(query);
    } else {
      messageIter = this.searchGlobal(query);
    }
    for await (let message of messageIter) {
      const albumIter = this.iterAlbum(message);
      for await (let element of albumIter) {
        if (Video.isVideoChannelMessage(element)) {
          const video = await this.getVideo(element);
          video.description.text = message.message;
          video.description.hashtags = getHashtags(message);
          if (signal && signal.aborted) {
            console.debug("Search aborted");
            return;
          }
          yield video;
        }
      }
    }
  }
}
