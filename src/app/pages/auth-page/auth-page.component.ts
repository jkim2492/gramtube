import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { validatePhoneNumber } from "@src/core/utils";
import { TelegramClient } from "@app/services/telegram/client";
import { Router } from "@angular/router";
import { SpinnerComponent } from "@app/components/spinner/spinner.component";

@Component({
  selector: "app-auth-page",
  templateUrl: "./auth-page.component.html",
  styleUrls: ["./auth-page.component.scss"],
  imports: [FormsModule, CommonModule, SpinnerComponent],
  standalone: true,
})
export class AuthPageComponent {
  phoneNumber: string = "";
  phoneCode?: string;
  phoneCodeHash: string = "";

  errorMsg: string = "";
  isLoading: boolean = false;

  fields = {
    phoneNumber: {
      header: "Sign in",
      onsubmit: this.sendCode.bind(this),
      name: "phoneNumber",
      label: "Phone Number",
      text: "Send Verification Code",
    },
    phoneCode: {
      header: "Sign in",
      onsubmit: this.verifyCode.bind(this),
      name: "phoneCode",
      label: "Verification Code",
      text: "Verify Code",
    },
  };

  constructor(private client: TelegramClient, private router: Router) {}

  async sendCode() {
    this.isLoading = true;
    this.errorMsg = "";
    const phoneNumber = this.phoneNumber;
    if (!validatePhoneNumber(phoneNumber)) {
      this.showError("Invalid Phone number");
      return;
    }
    try {
      this.phoneCodeHash = await this.client.sendCode(phoneNumber);
    } catch (e) {
      console.error(e);
      this.showError("Failed to send verification code");
      return;
    }
    this.isLoading = false;
  }

  async verifyCode() {
    if (!this.phoneCode) {
      return;
    }
    this.isLoading = true;
    this.errorMsg = "";
    const phoneNumber: string = this.phoneNumber;
    const phoneCodeHash: string = this.phoneCodeHash;
    const phoneCode: string = this.phoneCode;

    const signInParams = { phoneNumber, phoneCodeHash, phoneCode };
    try {
      await this.client.signIn(signInParams);
      await this.client.client.connect();
    } catch (error) {
      console.error(error);
      this.showError("Authentication failed. Please try again");
      return;
    }
    this.router.navigate([""]);
  }

  showError(msg?: string | null) {
    this.errorMsg = msg || "Unknown Error";
    this.reset();
  }
  reset() {
    this.phoneCode = undefined;
    this.phoneCodeHash = "";
    this.isLoading = false;
  }
}
