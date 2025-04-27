import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ButtonModule, FormModule } from "@coreui/angular";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { DropdownModule } from "@coreui/angular";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"],
  imports: [
    FormsModule,
    DropdownModule,
    ButtonModule,
    FontAwesomeModule,
    CommonModule,
    FormModule,
  ],
  standalone: true,
})
export class SearchBarComponent {
  public faSearch = faSearch;

  public query: string = "";
  public categories: string[] = ["My Chats", "Global"];
  public category: string = this.categories[0];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const category = this.route.snapshot.queryParamMap.get("category");
    if (category) {
      this.category = category;
    }
  }

  setCategory(category: string) {
    this.category = category;
  }

  submit() {
    const query = this.query;
    const category = this.category;

    if (query && category) {
      this.router.navigate(["search"], {
        queryParams: { query, category },
      });
    }
  }
}
