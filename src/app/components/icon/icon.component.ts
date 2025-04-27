import { Component } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { IconDefinition } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-icon",
  imports: [FontAwesomeModule],
  templateUrl: "./icon.component.html",
  styleUrl: "./icon.component.scss",
})
export class IconComponent {
  faGramTube: IconDefinition = {
    prefix: "fac",
    iconName: "gramtube",
    icon: [
      496,
      512,
      [],
      "",
      "M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM180,152L330,256L180,360L180,152Z",
    ],
  };
}
