import { Component, Input } from "@angular/core";
import { VideoThumbnailComponent } from "@app/components/video-thumbnail/video-thumbnail.component";
import { ChannelAvatarComponent } from "@app/components/channel-avatar/channel-avatar.component";
import { RouterModule } from "@angular/router";
import { Video } from "@app/models/video.model";
import { CommonModule } from "@angular/common";
import { TaggedTextComponent } from "@app/components/tagged-text/tagged-text.component";

@Component({
  selector: "app-video-card",
  imports: [
    VideoThumbnailComponent,
    ChannelAvatarComponent,
    RouterModule,
    CommonModule,
    TaggedTextComponent,
  ],
  templateUrl: "./video-card.component.html",
  styleUrl: "./video-card.component.scss",
})
export class VideoCardComponent {
  @Input() video!: Video;
}
