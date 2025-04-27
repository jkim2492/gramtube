import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TelegramApi } from "@app/services/api";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Video } from "@app/models/video.model";
import { VideoPlayerComponent } from "@app/components/video-player/video-player.component";
import { _BigInt, _Number } from "@src/core/utils";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faDownload, faBookmark } from "@fortawesome/free-solid-svg-icons";
import { DownloadManagerService } from "@app/services/downloadManager";
import { ErrorPageComponent } from "@app/pages/error-page/error-page.component";
import { CardModule } from "@coreui/angular";
import { TaggedTextComponent } from "@app/components/tagged-text/tagged-text.component";
import { ChannelAvatarComponent } from "@app/components/channel-avatar/channel-avatar.component";
@Component({
  selector: "app-video-page",
  templateUrl: "./viewer-page.component.html",
  styleUrls: ["./viewer-page.component.scss"],
  imports: [
    FormsModule,
    CommonModule,
    VideoPlayerComponent,
    FontAwesomeModule,
    ErrorPageComponent,
    CardModule,
    RouterModule,
    TaggedTextComponent,
    ChannelAvatarComponent,
  ],
  standalone: true,
})
export class ViewerPageComponent implements OnInit {
  video!: Video;
  faDownload = faDownload;
  faBookmark = faBookmark;
  error?: string;
  constructor(
    private route: ActivatedRoute,
    public api: TelegramApi,
    public manager: DownloadManagerService
  ) {}

  async saveVideo() {
    await this.api.client.save(this.video.message);
  }

  async ngOnInit(): Promise<void> {
    const channelId = _BigInt(this.route.snapshot.queryParamMap.get("channel"));
    const messageId = _Number(this.route.snapshot.queryParamMap.get("id"));
    if (messageId) {
      try {
        this.video = await this.api.search.getVideo({ channelId, messageId });
        console.debug("On viewer page for", this.video);
      } catch {
        this.error = "404";
      }
    } else {
      this.error = "400";
    }
  }
}
