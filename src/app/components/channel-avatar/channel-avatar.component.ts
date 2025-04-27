import { CommonModule } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Channel } from "@app/models/video.model";
import { AvatarModule } from "@coreui/angular";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-channel-avatar",
  imports: [RouterModule, AvatarModule, CommonModule, FontAwesomeModule],
  templateUrl: "./channel-avatar.component.html",
  styleUrl: "./channel-avatar.component.scss",
})
export class ChannelAvatarComponent {
  @Input() channel!: Channel;
  @Input() size: string = "";
  @ViewChild("avatar", { read: ElementRef }) avatar!: ElementRef;
  faUser = faUser;
  public loading = true;

  ngOnInit() {
    if (!this.channel) {
      throw new Error("Channel not found");
    }
  }

  waitImg(parentElement: HTMLElement): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.addedNodes) {
            Array.from(mutation.addedNodes).forEach((node) => {
              if (
                node instanceof HTMLImageElement &&
                node.classList.contains("avatar-img")
              ) {
                observer.disconnect();
                resolve(node);
              }
            });
          }
        }
      });

      observer.observe(parentElement, {
        childList: true,
        subtree: true,
      });
    });
  }

  async ngAfterViewInit() {
    if (!this.avatar) {
      return;
    }
    const avatarImg = await this.waitImg(this.avatar.nativeElement);
    if (avatarImg) {
      avatarImg.addEventListener(
        "load",
        () => {
          this.loading = false;
        },
        { once: true }
      );
    }
  }
}
