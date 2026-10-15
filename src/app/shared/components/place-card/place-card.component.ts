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
      <small class="status" [class.research]="place.sourceStatus === 'research'">{{ sourceLabel }}</small>
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
      churches: { it: 'Chiese', en: 'Churches', fr: 'Églises' },
      chapels: { it: 'Cappelle', en: 'Chapels', fr: 'Chapelles' },
      fountains: { it: 'Fontane', en: 'Fountains', fr: 'Fontaines' },
      'votive-shrines': { it: 'Edicole votive', en: 'Votive shrines', fr: 'Édicules votifs' },
      monuments: { it: 'Monumenti', en: 'Monuments', fr: 'Monuments' },
      belvedere: { it: 'Belvedere', en: 'Belvedere', fr: 'Belvédères' },
      viewpoints: { it: 'Punti panoramici', en: 'Viewpoints', fr: 'Points de vue' },
      'memory-places': { it: 'Luoghi della memoria', en: 'Places of memory', fr: 'Lieux de mémoire' },
      contrade: { it: 'Contrade', en: 'Rural districts', fr: 'Contrade' },
      trails: { it: 'Sentieri', en: 'Trails', fr: 'Sentiers' },
      'rural-architecture': { it: 'Architettura rurale', en: 'Rural architecture', fr: 'Architecture rurale' },
      'historic-farmhouses': { it: 'Casolari storici', en: 'Historic farmhouses', fr: 'Maisons rurales historiques' },
      'agricultural-landscape': { it: 'Paesaggio agricolo', en: 'Agricultural landscape', fr: 'Paysage agricole' },
      'natural-places': { it: 'Luoghi naturalistici', en: 'Natural places', fr: 'Lieux naturels' },
    };

    return labels[this.place.category]?.[this.i18n.currentLanguage()] ?? this.place.category;
  }

  get sourceLabel(): string {
    const status = this.place.sourceStatus ?? (this.place.isVerifiedContent ? 'verified' : 'to-verify');
    return this.i18n.t(`sourceStatus.${status}`);
  }
}
