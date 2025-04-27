import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-tagged-text",
  imports: [CommonModule],
  templateUrl: "./tagged-text.component.html",
  styleUrl: "./tagged-text.component.scss",
})
export class TaggedTextComponent {
  @Input() description!: {
    text: string;
    hashtags: { offset: number; length: number }[];
  };
  text: string = "";
  hashtags: { offset: number; length: number }[] = [];

  parsedText: Array<{ text: string; isHashtag: boolean }> = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.text = this.description.text;
    this.hashtags = this.description.hashtags;
    this.parsedText = this.parseText();
  }

  parseText(): Array<{ text: string; isHashtag: boolean }> {
    const result: Array<{ text: string; isHashtag: boolean }> = [];
    let currentIndex = 0;

    const sortedHashtags = [...this.hashtags].sort(
      (a, b) => a.offset - b.offset
    );

    for (const { offset, length } of sortedHashtags) {
      if (offset > currentIndex) {
        result.push({
          text: this.text.slice(currentIndex, offset),
          isHashtag: false,
        });
      }

      result.push({
        text: this.text.slice(offset, offset + length),
        isHashtag: true,
      });

      currentIndex = offset + length;
    }

    if (currentIndex < this.text.length) {
      result.push({
        text: this.text.slice(currentIndex),
        isHashtag: false,
      });
    }

    return result;
  }

  onHashtagClick(hashtag: string): void {
    this.router.navigate(["search"], {
      queryParams: { query: hashtag },
    });
  }
}
