import { Component, Input } from "@angular/core";
import { Video } from "@app/models/video.model";
import { RouterModule } from "@angular/router";
import { SpinnerComponent } from "@app/components/spinner/spinner.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-video-thumbnail",
  imports: [RouterModule, SpinnerComponent, CommonModule],
  templateUrl: "./video-thumbnail.component.html",
  styleUrl: "./video-thumbnail.component.scss",
})
export class VideoThumbnailComponent {
  @Input() video!: Video;
  public loading = true;
  public previewBlob?: string;

  ngOnInit() {
    if (this.video.thumbnailPreview) {
      const blob = new Blob([this.video.thumbnailPreview], {
        type: "application/octet-stream",
      });
      this.previewBlob = URL.createObjectURL(blob);
    }
  }
  revokePreview() {
    if (this.previewBlob) {
      URL.revokeObjectURL(this.previewBlob);
    }
  }
  onLoad() {
    this.loading = false;
    this.revokePreview();
  }
  ngOnDestroy() {
    this.revokePreview();
  }
}
