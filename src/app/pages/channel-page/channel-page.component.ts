import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Video, Channel } from "@app/models/video.model";
import { TelegramApi } from "@app/services/api";
import { AvatarModule, FormModule } from "@coreui/angular";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { SpinnerComponent } from "@app/components/spinner/spinner.component";
import { _BigInt, nextBatch } from "@src/core/utils";
import { FormsModule } from "@angular/forms";
import { ChannelAvatarComponent } from "@app/components/channel-avatar/channel-avatar.component";
import { VideoCardAltComponent } from "@app/components/video-card-alt/video-card-alt.component";
import { ErrorPageComponent } from "@app/pages/error-page/error-page.component";
@Component({
  selector: "app-channel-page",
  templateUrl: "./channel-page.component.html",
  styleUrls: ["./channel-page.component.scss"],
  imports: [
    CommonModule,
    AvatarModule,
    SpinnerComponent,
    InfiniteScrollDirective,
    RouterModule,
    FormsModule,
    FormModule,
    ChannelAvatarComponent,
    VideoCardAltComponent,
    ErrorPageComponent,
  ],
})
export class ChannelPageComponent {
  public channel!: Channel;
  public isLoading = false;
  public filter = "";
  public videoList: Video[] = [];
  public filteredList: Video[] = [];
  private videoIter!: AsyncGenerator<Video>;
  public error?: string;
  constructor(private route: ActivatedRoute, private api: TelegramApi) {}

  async ngOnInit() {
    const channelId = _BigInt(this.route.snapshot.queryParamMap.get("channel"));
    try {
      this.channel = await this.api.search.getChannel(channelId);
    } catch (e) {
      console.error(e);
      this.error = "404";
      throw new Error("Channel not found");
    }
    this.videoIter = this.api.search.searchChannel(this.channel);
    await this.loadVideos();
  }

  addVideo(video: Video) {
    this.videoList.push(video);

    if (this.isSearched(video)) {
      this.filteredList.push(video);
    }
  }

  async loadVideos() {
    this.isLoading = true;
    await nextBatch(this.videoIter, this.addVideo.bind(this));
    this.isLoading = false;
  }

  onScroll() {
    if (!this.isLoading) {
      this.loadVideos();
    }
  }

  isSearched(video: Video) {
    return (
      video.title.includes(this.filter) ||
      video.description.text.includes(this.filter)
    );
  }

  onSearch() {
    this.filteredList = this.videoList.filter(this.isSearched.bind(this));
  }

  async join() {
    await this.api.client.joinChannel(this.channel);
    this.ngOnInit();
  }
  async leave() {
    await this.api.client.leaveChannel(this.channel);
    this.ngOnInit();
  }
}
