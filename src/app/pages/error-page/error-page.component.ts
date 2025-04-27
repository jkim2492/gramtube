import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
@Component({
  selector: "app-error-page",
  templateUrl: "./error-page.component.html",
  styleUrls: ["./error-page.component.scss"],
  imports: [CommonModule],
  standalone: true,
})
export class ErrorPageComponent {
  @Input() errorCode?: string;
  @Input() errorMsg?: string;
  private errorList: Record<string, string> = {
    "500": "Unknown Error",
    "404": "Not found",
    "400": "Bad Request",
  };
  constructor() {}
  ngOnInit() {
    if (!this.errorCode && !this.errorMsg) {
      this.errorCode = "500";
      this.errorMsg = "Oops something went wrong! Please report the issue on GitHub";
    }
    else if (this.errorCode && !this.errorMsg) {
      this.errorMsg = this.errorList[this.errorCode];
    }
    console.log('error Message is',this.errorMsg)
  }
}
