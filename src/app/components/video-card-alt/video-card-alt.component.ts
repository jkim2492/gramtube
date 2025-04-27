import { Component, Input } from "@angular/core";
import { VideoThumbnailComponent } from "@app/components/video-thumbnail/video-thumbnail.component";
import { RouterModule } from "@angular/router";
import { Video } from "@app/models/video.model";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-video-card-alt",
  imports: [CommonModule, VideoThumbnailComponent, RouterModule],
  templateUrl: "./video-card-alt.component.html",
  styleUrl: "./video-card-alt.component.scss",
})
export class VideoCardAltComponent {
  @Input() video!: Video;
  size: any;
}
