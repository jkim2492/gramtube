import { ThisReceiver } from "@angular/compiler";
import { Injectable, inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { TelegramClient } from "@app/services/telegram/client";
@Injectable({ providedIn: "root" })
export class AuthGuard {
  constructor(private client: TelegramClient, private router: Router) {}

  async canActivate() {
    if (await this.client.isAuth()) {
      return true;
    } else {
      const tree = this.router.createUrlTree(["/login"]);
      return tree;
    }
  }
  async cannotActivate() {
    if (!(await this.client.isAuth())) {
      return true;
    } else {
      const tree = this.router.createUrlTree(["/"]);
      return tree;
    }
  }
}

export const toLogin: CanActivateFn = (_route, _state) => {
  return inject(AuthGuard).canActivate();
};

export const toHome: CanActivateFn = (_route, _state) => {
  return inject(AuthGuard).cannotActivate();
};
