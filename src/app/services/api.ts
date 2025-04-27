import { Injectable } from "@angular/core";
import { TelegramClient } from "@app/services/telegram/client";
import { TelegramSearch } from "@app/services/telegram/search";
import { TelegramDownload } from "@app/services/telegram/download";

@Injectable({
  providedIn: "root",
})
export class TelegramApi {
  constructor(
    public search: TelegramSearch,
    public download: TelegramDownload,
    public client: TelegramClient
  ) {}
}
