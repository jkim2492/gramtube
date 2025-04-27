import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SearchBarComponent } from "@app/components/search-bar/search-bar.component";
import { IconComponent } from "@app/components/icon/icon.component";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrls: ["./home-page.component.scss"],
  imports: [SearchBarComponent, IconComponent],
  standalone: true,
})
export class HomePageComponent {
  constructor(private router: Router) {}

  onSubmit(searchParams: any): void {
    if (searchParams.query) {
      this.router.navigate(["search"], { queryParams: searchParams });
    }
  }
}
