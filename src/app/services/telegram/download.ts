import { Injectable } from "@angular/core";
import { TelegramClient } from "@app/services/telegram/client";
import { TelegramSearch } from "@app/services/telegram/search";
import { VideoLike, MessageRef, ChannelLike } from "@app/models/video.model";
import { catBuffer, defaultdict, getChannelId, getVideoId, rdiv, toABuffer, toBuffer } from "@src/core/utils";
import { CHUNK_SIZE } from "@src/config";
import { CacheService } from "@app/services/cache";
import { Buffer } from "buffer";
import BigInt from "big-integer";
import { Mutex } from "async-mutex";

@Injectable({
  providedIn: "root",
})
export class TelegramDownload {
  private locks: Record<string, Mutex>;

  constructor(private client: TelegramClient, private search: TelegramSearch, private cacher: CacheService) {
    this.locks = defaultdict(() => new Mutex());
  }

  async _downloadChunk(messageLike: VideoLike, index: number = 0): Promise<Buffer> {
    await this.client.connect();
    const video = await this.search.getVideo(messageLike);
    console.debug(`Retrieving video chunk ${index} for`, video);
    const offset = index * CHUNK_SIZE;
    const size = Number(video.size);
    if (offset > size) {
      return Buffer.alloc(0);
    }

    const videoId = video.videoId;
    const videoStr = `${video.channelId}_${video.messageId}_${index}`;
    const lock = this.locks[videoStr];
    const release = await lock.acquire();
    try {
      let result = await this.cacher.getVideo(videoId, index);
      if (result) {
        console.debug(`Video chunk ${index} served from cache`);
        return toBuffer(result);
      }
      console.debug(`Starting download of chunk ${index}`);
      const videoIter = this.client.client.iterDownload({
        file: video.file,
        offset: BigInt(offset),
        requestSize: CHUNK_SIZE,
      });
      let iterResult = await videoIter[Symbol.asyncIterator]().next();
      const buffer = iterResult.value;
      await this.cacher.addVideo(videoId, index, buffer);
      return buffer;
    } catch (error) {
      console.error(error);
      console.error(video);
      throw new Error("Video download failed");
    } finally {
      release();
    }
  }

  async downloadChunk(videoLike: VideoLike, start: number = 0) {
    console.debug(`Starting download at byte position ${start} for`, videoLike);
    const videoId = getVideoId(videoLike);
    const { quotient, remainder } = rdiv(start, CHUNK_SIZE);
    const indices = remainder === 0 ? [quotient] : [quotient, quotient + 1];
    let buffer = Buffer.alloc(0);
    for (let index of indices) {
      let result = await this._downloadChunk(videoId, index);
      buffer = catBuffer([buffer, result]);
    }
    buffer = buffer.subarray(remainder);
    return buffer;
  }

  async downloadWhole(
    videoLike: VideoLike,
    progress?: (a: MessageRef, b: number, c: number) => any,
    signal?: AbortSignal
  ) {
    const video = await this.search.getVideo(videoLike);
    const videoId = video.videoId;

    const totalSize = Number(video.size);
    const result = new Uint8Array(totalSize);
    let curr = 0;

    while (curr < totalSize) {
      if (signal && signal.aborted) {
        console.debug("Download aborted by user", video);
        return;
      }
      const bytesToCopy = Math.min(CHUNK_SIZE, totalSize - curr);
      const chunk = await this.downloadChunk(videoId, curr);
      if (progress && signal && !signal.aborted) {
        progress(videoId, curr, totalSize);
      }
      // Assuming chunk is a Buffer or Uint8Array, set its bytes into result at offset curr
      result.set(chunk, curr);
      curr += bytesToCopy;
    }

    return result.buffer;
  }

  async getThumbnail(videoLike: VideoLike) {
    const videoId = getVideoId(videoLike);
    let abuffer: ArrayBuffer | undefined;
    abuffer = await this.cacher.getThumbnail(videoId);
  
    if (abuffer) {
      console.debug("Thumbnail served from cache:", videoLike);
      return abuffer;
    }

    let video = await this.search.getVideo(videoId);
    if (!video.message.video?.thumbs) {
      return;
    }
    const bestIndex = video.message.video.thumbs.length - 1;
    let buffer = await this.client.client.downloadMedia(video.message, {
      thumb: bestIndex,
    });
    if (buffer instanceof Buffer) {
      await this.cacher.addThumbnail(videoId, toABuffer(buffer));
    }
    return buffer;
  }

  async getChannelPhoto(channelLike: ChannelLike) {
    const channelId = getChannelId(channelLike);
    let abuffer: ArrayBuffer | undefined;
    abuffer = await this.cacher.getChannelPhoto(channelId);
    if (abuffer) {
      return abuffer;
    }
    const channel = await this.search.getChannel(channelId);
    const buffer = await this.client.client.downloadProfilePhoto(channel);
    if (buffer instanceof Buffer) {
      await this.cacher.addChannelPhoto(channelId, toABuffer(buffer));
    }
    return buffer;
  }

  async getVideoLength(videoLike: VideoLike) {
    const video = await this.search.getVideo(videoLike);
    return video.size.toString();
  }
}
