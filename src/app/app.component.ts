import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavBarComponent } from "@app/components/nav-bar/nav-bar.component";
import { Meta, Title } from "@angular/platform-browser";
import { TelegramClient } from "./services/telegram/client";
import { WorkerController } from "./services/controller";
import { CommonModule } from "@angular/common";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { compatTest } from "@src/core/utils";
import { ErrorPageComponent } from "./pages/error-page/error-page.component";
@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavBarComponent, CommonModule, SpinnerComponent, ErrorPageComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  providers: [],
})
export class AppComponent {
  public controllerLoading = true;
  public telegramLoading = true;
  public errorMsg?: string;

  constructor(
    private meta: Meta,
    private titleService: Title,
    public client: TelegramClient,
    public controller: WorkerController
  ) {
    const compatResult = compatTest();
    if (compatResult) {
      this.errorMsg = compatResult;
      return;
    }
    client.init().then(() => {
      this.telegramLoading = false;
      console.log("telegram init");
    });
    controller.init().then(() => {
      this.controllerLoading = false;
      console.log("controller init");
    });
  }

  ngOnInit() {
    this.updateMetaTags();
  }

  updateMetaTags() {
    this.titleService.setTitle("GramTube");

    // Standard Meta Tags
    this.meta.addTag({ name: "description", content: "Unofficial Telegram Video Browser and Downloader" });
    this.meta.addTag({ name: "keywords", content: "Telegram, Video, Player, Browser, Downloader, Media" });

    // Open Graph Meta Tags
    this.meta.addTag({ property: "og:title", content: "GramTube" });
    this.meta.addTag({ property: "og:description", content: "Unofficial Telegram Video Browser and Downloader" });
    this.meta.addTag({ property: "og:image", content: "favicon.ico" });
  }
}
