import { Injectable } from "@angular/core";
import { VideoLike, MessageRef } from "@app/models/video.model";
import { TelegramDownload } from "@app/services/telegram/download";
import { TelegramSearch } from "@app/services/telegram/search";
import { getVideoId } from "@src/core/utils";

@Injectable({
  providedIn: "root",
})
export class DownloadManagerService {
  public downloadMap: Map<
    string,
    {
      title: string;
      progress: number;
      total: number;
      controller: AbortController;
    }
  > = new Map();

  constructor(
    public download: TelegramDownload,
    public search: TelegramSearch
  ) {}

  async cancelDownload(videoLike: VideoLike) {
    const item = this.getItem(videoLike);
    item.controller.abort();
    this.delItem(videoLike)!;
  }

  getItem(videoLike: VideoLike): {
    title: string;
    progress: number;
    total: number;
    controller: AbortController;
  } {
    const videoId = getVideoId(videoLike);
    const key = this.createKey(videoId);
    if (!this.downloadMap.has(key)) {
      throw new Error("Download not started yet");
    }
    const item = this.downloadMap.get(key)!;
    return item;
  }

  delItem(videoLike: VideoLike): void {
    const videoId = getVideoId(videoLike);
    const key = this.createKey(videoId);
    if (!this.downloadMap.has(key)) {
      throw new Error("Download not started yet");
    }
    this.downloadMap.delete(key);
  }

  async downloadFile(videoLike: VideoLike) {
    const video = await this.search.getVideo(videoLike);
    const { channelId, messageId } = video.videoId;

    const key = this.createKey(video.videoId);
    if (this.downloadMap.has(key)) {
      console.error("Download already in progress");
      return;
    }
    let controller = new AbortController();
    this.downloadMap.set(key, {
      title: video.title,
      progress: 0,
      total: video.size,
      controller,
    });

    try {
      var downloadedChunks = await this.download.downloadWhole(
        {
          channelId,
          messageId,
        },
        this.updateProgress.bind(this),
        controller.signal
      );
      if (!downloadedChunks) {
        if (!controller.signal.aborted) {
          throw new Error("Nothing downloaded!");
        }
        return;
      }
      const fileBlob = new Blob([downloadedChunks], {
        type: "video/mp4",
      });
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(fileBlob);
      downloadLink.download = video.filename;
      downloadLink.click();
      window.URL.revokeObjectURL(downloadLink.href);
    } finally {
      this.downloadMap.delete(key);
    }
  }

  createKey(videoId: MessageRef) {
    return `${videoId.channelId}-${videoId.messageId}`;
  }

  updateProgress(videoId: MessageRef, progress: number) {
    const item = this.getItem(videoId);
    item.progress = progress;
  }
}
