import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TelegramApi } from "@app/services/api";
import { ActivatedRoute } from "@angular/router";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Video } from "@app/models/video.model";
import { SpinnerComponent } from "@app/components/spinner/spinner.component";
import { VideoCardComponent } from "@app/components/video-card/video-card.component";
import { nextBatch } from "@src/core/utils";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";

@Component({
  selector: "app-search-page",
  templateUrl: "./search-page.component.html",
  styleUrls: ["./search-page.component.scss"],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    SpinnerComponent,
    VideoCardComponent,
    InfiniteScrollDirective,
  ],
  standalone: true,
})
export class SearchPageComponent {
  public videoList: Video[] = [];
  private videoIter!: AsyncGenerator<Video>;
  public isLoading;
  private controller: AbortController;

  constructor(private route: ActivatedRoute, private api: TelegramApi) {
    this.isLoading = false;
    this.controller = new AbortController();
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(async () => {
      this.clearVideos();
      this.controller = new AbortController();
      const query = this.route.snapshot.queryParamMap.get("query");
      const category =
        this.route.snapshot.queryParamMap.get("category") || null;
      if (!query) return;
      this.videoIter = this.api.search.search(
        query,
        category,
        this.controller.signal
      );
      this.loadVideos();
    });
  }

  addVideo(video: Video) {
    this.videoList.push(video);
  }

  onScroll() {
    if (!this.isLoading) {
      this.loadVideos();
    }
  }

  async loadVideos() {
    this.isLoading = true;
    await nextBatch(this.videoIter, this.addVideo.bind(this));
    this.isLoading = false;
  }

  clearVideos() {
    this.controller.abort();
    this.isLoading = false;
    this.videoList = [];
  }

  ngOnDestroy(): void {
    this.clearVideos();
  }
}
