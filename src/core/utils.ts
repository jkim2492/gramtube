import { Buffer } from "buffer";
import { ChannelId, ChannelLike, MessageRef, Video, VideoLike } from "@app/models/video.model";
import { Api } from "telegram";
import { formatDistanceToNow } from "date-fns";
import { LOAD_LIMIT } from "@src/config";

export function compatTest(): undefined | string {
  console.log("in compat Test");
  if ("serviceWorker" in navigator) {
    return;
  } else {
    return "Service worker not supported in this browser. If using incognito, please try without incognito";
  }
}

export function _BigInt(value: string | number | bigint | bigInt.BigInteger | null): bigint {
  if (value === null) {
    throw new Error("Unexpected value, null");
  }
  const num = BigInt(value?.toString());
  return num;
}

export function _Number(value: string | number | null | undefined): number {
  if (value === undefined || value === null) {
    throw new Error("Unexpected value, null");
  }
  const num = Number(value);
  return num;
}

export function datestr(epochTime: number): string {
  const date = new Date(epochTime * 1000);
  const formattedDate = formatDistanceToNow(date, { addSuffix: true });
  return formattedDate;
}

export function durstr(seconds: number): string {
  if (seconds < 0) {
    throw new Error("Duration cannot be negative");
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}
export function catBuffer(buffers: Buffer[]) {
  const len = buffersLength(buffers);
  return Buffer.concat(buffers, len);
}

export function buffersLength(buffers: Buffer[]) {
  let len = 0;
  for (let buffer of buffers) {
    len += buffer.length;
  }
  return len;
}
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{5,14}$/;
  return phoneRegex.test(phone);
}

export function toABuffer(buffer: Buffer): ArrayBuffer {
  const abuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  return abuffer as ArrayBuffer;
}
export function buildQuery(path: string, params: any) {
  const url = new URL(path, "http://base");
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.pathname + url.search;
}

export const toBuffer = (arrayBuffer: ArrayBuffer): Buffer => {
  return Buffer.from(arrayBuffer);
};

export function isTransferable(value: any): boolean {
  return (
    value instanceof ArrayBuffer ||
    value instanceof MessagePort ||
    value instanceof ImageBitmap ||
    value instanceof OffscreenCanvas ||
    (typeof ReadableStream !== "undefined" && value instanceof ReadableStream) ||
    (typeof WritableStream !== "undefined" && value instanceof WritableStream)
  );
}

export function rdiv(dividend: number, divisor: number) {
  if (divisor === 0) {
    throw new Error("Divisor cannot be zero");
  }
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  return { quotient, remainder };
}

export function defaultdict<T>(defaultFactory: () => T): Record<string, T> {
  return new Proxy<Record<string, T>>(
    {},
    {
      get: (target, key: string) => {
        if (!(key in target)) {
          target[key] = defaultFactory();
        }
        return target[key];
      },
    }
  );
}

export function getChannelId(channelLike: ChannelLike): ChannelId {
  if (typeof channelLike === "bigint" || typeof channelLike === "number") {
    return BigInt(channelLike);
  }
  if (channelLike instanceof Api.Channel) {
    return BigInt(channelLike.id.toString());
  }
  if (channelLike instanceof Api.Message) {
    if (channelLike.peerId instanceof Api.PeerChannel) {
      return BigInt(channelLike.peerId.channelId.toString());
    }
  }
  console.error(channelLike);
  throw new Error("Only channels are supported");
}

export function getVideoId(videoLike: VideoLike): MessageRef {
  if (videoLike instanceof Video) {
    return videoLike.videoId;
  }
  return videoLike;
}

export function getHashtags(message: Api.Message) {
  const hahstags = message.entities
    ?.filter((element) => element.className == "MessageEntityHashtag")
    .map((element) => ({ offset: element.offset, length: element.length }));
  return hahstags || [];
}

function getStore() {
  if (localStorage.getItem("gramtube") === null) {
    localStorage.setItem("gramtube", "{}");
    return {};
  }
  return JSON.parse(localStorage.getItem("gramtube")!);
}

export function storeSet(key: string, value: any) {
  var store = getStore();
  store[key] = value;
  localStorage.setItem("gramtube", JSON.stringify(store));
}

export function storeGet(key: string) {
  var store = getStore();
  if (!Object.hasOwn(store, key)) {
    return null;
  }
  const value = store[key];
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

export async function nextBatch<T>(
  asyncIterator: AsyncIterator<T>,
  callback: (item: T) => void,
  batchSize: number = LOAD_LIMIT
): Promise<void> {
  for (let i = 0; i < batchSize; i++) {
    const { value, done } = await asyncIterator.next();
    if (done) {
      console.log("done");
      break;
    }
    callback(value);
  }
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
