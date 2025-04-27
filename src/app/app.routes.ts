import { Routes } from "@angular/router";
import { HomePageComponent } from "@app/pages/home-page/home-page.component";
import { SearchPageComponent } from "@app/pages/search-page/search-page.component";
import { ViewerPageComponent } from "@app/pages/viewer-page/viewer-page.component";
import { ChannelPageComponent } from "@app/pages/channel-page/channel-page.component";
import { AuthPageComponent } from "@app/pages/auth-page/auth-page.component";
import { toLogin, toHome } from "@app/auth.guard";

export const routes: Routes = [
  { path: "", component: HomePageComponent, canActivate: [toLogin] },
  {
    path: "login",
    component: AuthPageComponent,
     canActivate: [toHome]
  },
  { path: "search", component: SearchPageComponent, canActivate: [toLogin] },
  { path: "watch", component: ViewerPageComponent, canActivate: [toLogin] },
  {
    path: "channel",
    component: ChannelPageComponent,
    canActivate: [toLogin],
  },
];
