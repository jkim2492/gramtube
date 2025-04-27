import { Component } from "@angular/core";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { DownloadManagerService } from "@app/services/downloadManager";
import { DropdownModule, ButtonModule, BadgeModule } from "@coreui/angular";
import { _BigInt, _Number } from "@src/core/utils";
@Component({
  selector: "app-download-dropdown",
  templateUrl: "./download-dropdown.html",
  styleUrls: ["./download-dropdown.scss"],
  imports: [
    FormsModule,
    FontAwesomeModule,
    CommonModule,
    DropdownModule,
    BadgeModule,
    ButtonModule,
  ],
  standalone: true,
})
export class DownloadDropdown {
  Math = Math;
  public faDownload = faDownload;
  public faClose = faClose;
  public downloadMap: Map<
    string,
    {
      title: string;
      progress: number;
      total: number;
      controller: AbortController;
    }
  >;
  constructor(public service: DownloadManagerService) {
    this.downloadMap = this.service.downloadMap;
  }

  cancelDownload(key: string) {
    const keys = key.split("-");
    const channelId = _BigInt(keys[0]);
    const messageId = _Number(keys[1]);

    if (!this.downloadMap.has(key)) {
      throw new Error("No download to cancel");
    }
    this.service.cancelDownload({ channelId, messageId });
    this.downloadMap.delete(key);
  }
}
