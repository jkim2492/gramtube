import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SearchBarComponent } from "@app/components/search-bar/search-bar.component";
import { DownloadDropdown } from "@app/components/downlod-manager/download-dropdown";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { Router, RouterModule } from "@angular/router";
import { NavbarModule } from "@coreui/angular";
import { IconComponent } from "@app/components/icon/icon.component";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

@Component({
  selector: "app-nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.scss"],
  imports: [
    FormsModule,
    SearchBarComponent,
    DownloadDropdown,
    FontAwesomeModule,
    NavbarModule,
    CommonModule,
    RouterModule,
    IconComponent,
  ],
  standalone: true,
})
export class NavBarComponent {
  private currentRoute?: string;
  faGithub = faGithub
  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  isHome(): boolean {
    return this.currentRoute === "/";
  }
  isLogin(): boolean {
    return this.currentRoute === "/login";
  }
}
