import { Injectable } from "@angular/core";
import { getChannelId } from "@src/core/utils";
import { ChannelRef, MessageRef } from "@app/models/video.model";
import { CACHE } from "@src/config";

@Injectable({
  providedIn: "root",
})
export class CacheService {
  private dbName = "gramtube";
  private dbVersion = 1;
  private seqStoreName = "sequence";
  private flatStoreName = "flat";

  constructor() {
    if (!CACHE) {
      return this.noop();
    }
    this.initDB();
  }

  private noop() {
    return new Proxy<CacheService>(this, {
      get: (target: CacheService, prop: string | symbol) => {
        if (typeof target[prop as keyof CacheService] === "function") {
          return () => undefined;
        }
        return target[prop as keyof CacheService];
      },
    });
  }

  private createStore(db: IDBDatabase, storeName: string): void {
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: "key" });
    }
  }

  private createStores(event: IDBVersionChangeEvent) {
    const db = (event.target as IDBOpenDBRequest).result;

    this.createStore(db, this.seqStoreName);
    this.createStore(db, this.flatStoreName);
  }

  private async initDB(): Promise<void> {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = (event) => {
      this.createStores(event);
    };

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addData(
    storeName: string,
    key: string,
    value: ArrayBuffer
  ): Promise<void> {
    const db = await this.openDatabase();

    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.put({ key, value });

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getData(
    storeName: string,
    key: string
  ): Promise<ArrayBuffer | undefined> {
    const db = await this.openDatabase();

    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async addThumbnail(videoId: MessageRef, data: ArrayBuffer) {
    const key = this.createKey("thumb", videoId.channelId, videoId.messageId);
    return await this.addData(this.flatStoreName, key, data);
  }

  async getThumbnail(videoId: MessageRef) {
    const key = this.createKey("thumb", videoId.channelId, videoId.messageId);
    const value = await this.getData(this.flatStoreName, key);
    return value;
  }

  async addChannelPhoto(channelRef: ChannelRef, data: ArrayBuffer) {
    const channelId = getChannelId(channelRef);
    const key = this.createKey("avatar", channelId, 0);
    return await this.addData(this.flatStoreName, key, data);
  }

  async getChannelPhoto(channelRef: ChannelRef) {
    const channelId = getChannelId(channelRef);
    const key = this.createKey("avatar", channelId, 0);
    return await this.getData(this.flatStoreName, key);
  }

  async addVideo(videoId: MessageRef, index: number, data: ArrayBuffer) {
    const key = this.createKey(
      "video",
      videoId.channelId,
      videoId.messageId,
      index
    );
    return await this.addData(this.seqStoreName, key, data);
  }

  async getVideo(videoId: MessageRef, index: number) {
    const key = this.createKey(
      "video",
      videoId.channelId,
      videoId.messageId,
      index
    );
    return await this.getData(this.seqStoreName, key);
  }

  private openDatabase(): Promise<IDBDatabase> {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private createKey(...args: any[]): string {
    return args.map((arg) => (arg ? String(arg) : "null")).join("/");
  }

  private async clearStore(storeName: string): Promise<void> {
    const db = await this.openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const clearRequest = store.clear();

    return new Promise((resolve, reject) => {
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  async clear() {
    await this.clearStore(this.seqStoreName)
    await this.clearStore(this.flatStoreName)
  }
}
