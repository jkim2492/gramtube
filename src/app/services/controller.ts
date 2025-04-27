import { Injectable } from "@angular/core";
import { TelegramDownload } from "@app/services/telegram/download";
import { toABuffer, isTransferable } from "@src/core/utils";
import { Buffer } from "buffer";

@Injectable({
  providedIn: "root",
})
export class WorkerController {
  private ports: MessagePort[] = [];

  constructor(private download: TelegramDownload) {}
  async init() {
    if ("serviceWorker" in navigator) {
      console.log("Service Worker is available");
    } else {
      console.log("Service Worker is not available");
    }
    await navigator.serviceWorker.ready;
    await this.waitForController();
    navigator.serviceWorker.onmessage = this.handleMessage.bind(this);
    this.sendMessage("initController");
  }

  sendMessage(message: any): void {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    } else {
      console.error("No active Service Worker to send messages to.");
    }
  }

  async waitForController(): Promise<void> {
    if (navigator.serviceWorker.controller) {
      return;
    }

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (navigator.serviceWorker.controller) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  async handleMessage(event: MessageEvent) {
    const functionName: keyof TelegramDownload = event.data.functionName;
    const args: [unknown, ...unknown[]] = event.data.args as [unknown, ...unknown[]];
    const port = event.ports[0];
    this.ports.push(port);
    if (!(typeof this.download[functionName] === "function")) {
      throw new Error("Service Worker requested function");
    }
    let result = await (this.download[functionName] as Function)(...args);
    if (result instanceof Buffer) {
      result = toABuffer(result);
    }
    if (isTransferable(result)) {
      port.postMessage(result, [result]);
      return;
    }
    port.postMessage(result);
  }
}
