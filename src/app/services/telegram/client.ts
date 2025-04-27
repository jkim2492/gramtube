import { Injectable } from "@angular/core";
import { TelegramClient as TClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { API_ID, API_HASH, SESSION_STRING } from "@src/config";
import { LogLevel } from "telegram/extensions/Logger";
import { UserAuthParams } from "telegram/client/auth";
import { storeGet, storeSet } from "@src/core/utils";

@Injectable({
  providedIn: "root",
})
export class TelegramClient {
  public client!: TClient;
  public initialized = false;

  async init() {
    console.debug("Starting TelegramClient");
    const sessionString = SESSION_STRING || storeGet("sessionString") || "";
    try {
      this.client = new TClient(new StringSession(sessionString), API_ID, API_HASH, {
        useWSS: true,
      });
      await this.client.start({} as UserAuthParams);
    } catch (e) {
      console.debug("SessionString expired. Logging in again.");
      this.client = new TClient(new StringSession(""), API_ID, API_HASH, {
        useWSS: true,
      });
    }
    this.client.setLogLevel("error" as LogLevel);
    this.initialized = true;
  }

  async awaitInit(): Promise<void> {
    while (!this.initialized) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async isAuth() {
    await this.awaitInit()
    return this.client && (await this.client.isUserAuthorized());
  }

  async sendCode(phoneNumber: string) {
    await this.client.connect();
    const result = await this.client.sendCode(
      {
        apiId: API_ID,
        apiHash: API_HASH,
      },
      phoneNumber
    );
    return result.phoneCodeHash;
  }

  async signIn(params: { phoneNumber: string; phoneCode: string; phoneCodeHash: string }) {
    try {
      await this.client.connect();
      await this.client.invoke(new Api.auth.SignIn(params));
    } catch (error) {
      console.error(error);
      throw new Error("Authentication Failed");
    }
    const sessionString = this.client.session.save() as unknown as string;
    storeSet("sessionString", sessionString);
  }

  async connect() {
    await this.client.connect();
  }

  async save(message: Api.Message) {
    await this.client.forwardMessages("me", {
      messages: message,
      fromPeer: "",
    });
  }

  async joinChannel(channel: Api.Channel) {
    await this.client.invoke(
      new Api.channels.JoinChannel({
        channel,
      })
    );
  }

  async leaveChannel(channel: Api.Channel) {
    await this.client.invoke(
      new Api.channels.LeaveChannel({
        channel,
      })
    );
  }
}
