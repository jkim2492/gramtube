import { Router, SW, Controller, Runner } from "./tserver";

class Routes {
  static parseRange(headers: Headers): number {
    const rangeHeader = headers.get("Range");

    if (!rangeHeader) {
      return 0;
    }

    let start = 0;
    var match = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
    if (match) {
      start = parseInt(match[1], 10) || 0;
    }
    return start;
  }

  @Router.get("/stream")
  async handleStreamGet(event: FetchEvent, params: any) {
    const videoId = {
      messageId: Number(params.messageId),
      channelId: Number(params.channelId),
    };
    const requestHeaders = event.request.headers;
    const start = Routes.parseRange(requestHeaders);

    const chunk = await Runner.run.downloadChunk(videoId, start);

    const totalSize = await Runner.run.getVideoLength(videoId);
    const end = start + chunk.byteLength - 1;
    const headers: Record<string, string> = {
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${totalSize}`,
    };

    return new Response(chunk, { status: 206, headers });
  }

  @Router.get("/thumbnail")
  async getThumbnail(_event: FetchEvent, params: any) {
    const videoId = {
      messageId: Number(params.messageId),
      channelId: Number(params.channelId),
    };
    const thumbnailBuffer = await Runner.run.getThumbnail(videoId);
    return new Response(thumbnailBuffer);
  }

  @Router.get("/avatar")
  async getChannelPhoto(_event: FetchEvent, params: any) {
    const channelPhotoBuffer = await Runner.run.getChannelPhoto(
      Number(params.channelId)
    );
    return new Response(channelPhotoBuffer);
  }
}
SW.addEventListener("install", (_) => {
  SW.skipWaiting();
});

SW.addEventListener("activate", (event) => {
  event.waitUntil(SW.clients.claim());
});
Router.startListener();
Controller.startListener();
