import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-place-card',
  template: `
    <button
      type="button"
      class="place-card"
      [class.selected]="selected"
      (click)="selectedPlace.emit(place)"
    >
      <img [src]="place.image" [alt]="i18n.localize(place.alt)" loading="lazy" />
      <span class="eyebrow">{{ categoryLabel }}</span>
      <strong>{{ i18n.localize(place.name) }}</strong>
      <span>{{ i18n.localize(place.shortDescription) }}</span>
    </button>
  `,
})
export class PlaceCardComponent {
  readonly i18n = inject(LanguageService);
  @Input({ required: true }) place!: Place;
  @Input() selected = false;
  @Output() selectedPlace = new EventEmitter<Place>();

  get categoryLabel(): string {
    const labels: Record<string, Record<'it' | 'en' | 'fr', string>> = {
      heritage: { it: 'Patrimonio', en: 'Heritage', fr: 'Patrimoine' },
      community: { it: 'Comunita', en: 'Community', fr: 'Communauté' },
      memory: { it: 'Memoria', en: 'Memory', fr: 'Mémoire' },
      viewpoint: { it: 'Paesaggio', en: 'Landscape', fr: 'Paysage' },
    };

    return labels[this.place.category]?.[this.i18n.currentLanguage()] ?? this.place.category;
  }
}
