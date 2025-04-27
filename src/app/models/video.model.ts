import { Api } from "telegram";
import {
  datestr,
  buildQuery,
  durstr,
  _BigInt,
  getHashtags,
} from "@src/core/utils";
import { strippedPhotoToJpg } from "telegram/Utils";
import bigInt from "big-integer";

export class Video {
  public messageId: number;
  public channelId: ChannelId;

  public videoId: MessageRef;
  public views: number;
  public description: { text: string; hashtags: any[] };
  public title: string;
  public duration: string;
  public size: number;
  public file: Api.TypeMessageMedia;
  public filename: string;
  public date: string;
  public thumbnail: string;
  public thumbnailPreview?: Uint8Array;
  public stream: string;

  constructor(public message: VideoChannelMessage, public channel: Channel) {
    this.channelId = _BigInt(this.channel.id);

    this.messageId = message.id;
    this.videoId = {
      messageId: this.messageId,
      channelId: this.channelId,
    };
    this.filename =
      (message.file.name || "").replace(/\.mp4$/, "").trim() || "untitled.mp4";
    this.title = this.filename.replace(/\.mp4$/, "");
    this.duration = durstr(message.video.attributes[0].duration);
    this.views = message.views || 0;
    this.description = { text: "", hashtags: [] };
    this.description.text = message.message;
    this.description.hashtags = getHashtags(message);

    this.date = datestr(message.date);
    this.size = Number(message.file.size.toString());
    this.file = message.media;
    if (message.video.thumbs) {
      if (message.video.thumbs[0].className === "PhotoStrippedSize") {
        this.thumbnailPreview = strippedPhotoToJpg(
          message.video.thumbs![0].bytes as any
        );
      }
      this.thumbnail = buildQuery("/thumbnail", {
        channelId: this.channelId,
        messageId: this.messageId,
      });
    }
    else {
      this.thumbnail = '/placeholder.png';
    }
    this.stream = buildQuery("/stream", {
      channelId: this.channelId,
      messageId: this.messageId,
    });

    if (this.channel && this.channel?.photo.className !== "ChatPhotoEmpty") {
      this.channel.avatar = buildQuery("/avatar", {
        channelId: this.channelId,
      });
    }
  }

  static isVideoChannelMessage(message: Api.Message) {
    return Video.isVideoMessage(message) && Video.isChannelMessage(message);
  }

  static isVideoMessage(message: Api.Message): message is VideoMessage {
    const isvideo =
      !!message.file &&
      !!message.media &&
      !!message.file.size &&
      !!message.video &&
      !!message.media &&
      message.video?.attributes?.[0]?.className === "DocumentAttributeVideo" &&
      !!message.video?.attributes?.[0]?.duration;

    return isvideo;
  }
  static isChannelMessage(message: Api.Message): message is ChannelMessage {
    return message.peerId instanceof Api.PeerChannel;
  }
}

export type ChannelId = bigint;

export type MessageRef = {
  messageId: number;
  channelId: ChannelId;
};

export type ChannelRef = ChannelId | { channelId: ChannelId };
export type Channel = Api.Channel & { avatar?: string; id: bigInt.BigInteger };

export type MessageLike = MessageRef | Api.Message;
export type ChannelMessage = Api.Message & { peerId: Api.PeerChannel };
export type ChannelLike =
  | ChannelRef
  | Channel
  | ChannelMessage
  | Video
  | Api.InputChannel;
export type VideoLike = MessageRef | Video;
export type VideoMessage = Api.Message & {
  file: { size: number } & Api.TypeMessageMedia;
  video: {
    attributes: [{ className: "DocumentAttributeVideo"; duration: number }];
  };
  media: Api.TypeMessageMedia;
};
export type VideoChannelMessage = VideoMessage & ChannelMessage;
