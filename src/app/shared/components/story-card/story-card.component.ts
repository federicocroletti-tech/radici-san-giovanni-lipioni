import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Place } from '../../../core/models/place.model';
import { Story } from '../../../core/models/story.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-story-card',
  template: `
    <article class="content-card story-card">
      <p class="eyebrow">{{ themeLabel }} · {{ i18n.t('stories.mockNotice') }}</p>
      <h2>{{ i18n.localize(story.title) }}</h2>
      <p>{{ i18n.localize(story.excerpt) }}</p>
      <p class="muted">{{ i18n.localize(story.consentRequiredNotice) }}</p>
      <div class="chips" aria-label="Linked places">
        @for (place of linkedPlaces; track place.id) {
          <button type="button" class="chip" (click)="openPlace.emit(place.id)">
            {{ i18n.localize(place.name) }}
          </button>
        }
      </div>
    </article>
  `,
})
export class StoryCardComponent {
  readonly i18n = inject(LanguageService);
  @Input({ required: true }) story!: Story;
  @Input() places: Place[] = [];
  @Output() openPlace = new EventEmitter<string>();

  get themeLabel(): string {
    const labels: Record<string, Record<'it' | 'en' | 'fr', string>> = {
      ritorni: { it: 'Ritorni', en: 'Returns', fr: 'Retours' },
      fontana: { it: 'Fontana', en: 'Fountain', fr: 'Fontaine' },
      scalinate: { it: 'Scalinate', en: 'Steps', fr: 'Escaliers' },
    };

    return labels[this.story.theme]?.[this.i18n.currentLanguage()] ?? this.story.theme;
  }

  get linkedPlaces(): Place[] {
    return this.story.relatedPlaceIds
      .map((placeId) => this.places.find((place) => place.id === placeId))
      .filter((place): place is Place => Boolean(place));
  }
}
