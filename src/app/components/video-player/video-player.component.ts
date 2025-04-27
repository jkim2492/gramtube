import { Component, Input, OnInit, OnDestroy , ViewChild, ElementRef } from "@angular/core";
import { Video } from "@app/models/video.model";

@Component({
  selector: "app-video-player",
  templateUrl: "./video-player.component.html",
  styleUrls: ["./video-player.component.scss"],
  standalone: true,
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @Input() video!: Video;
  @ViewChild('player') player!: ElementRef;

  public url?: string;

  ngOnInit() {
    this.url = this.video.stream;
  }

  ngOnDestroy(): void {
    this.url = '';
    this.player.nativeElement.pause()
    this.player.nativeElement.src = ''
    this.player.nativeElement.load()
  }
}
