import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Itinerary } from '../../../core/models/itinerary.model';
import { Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-itinerary-card',
  template: `
    <article class="content-card itinerary-card">
      <p class="eyebrow">
        {{ i18n.t('itineraries.duration') }}: {{ i18n.localize(itinerary.duration) }}
      </p>
      <h2>{{ i18n.localize(itinerary.title) }}</h2>
      <p>{{ i18n.localize(itinerary.shortDescription) }}</p>
      <dl>
        <div>
          <dt>{{ i18n.t('itineraries.difficulty') }}</dt>
          <dd>{{ i18n.localize(itinerary.difficulty) }}</dd>
        </div>
        <div>
          <dt>{{ i18n.t('itineraries.places') }}</dt>
          <dd>{{ placeNames }}</dd>
        </div>
      </dl>
      <div class="actions-row">
        <button type="button" class="button" (click)="openMap.emit(itinerary)">
          {{ i18n.t('itineraries.openMap') }}
        </button>
        <button type="button" class="button secondary" (click)="ask.emit(itinerary)">
          {{ i18n.t('itineraries.ask') }}
        </button>
      </div>
    </article>
  `,
})
export class ItineraryCardComponent {
  readonly i18n = inject(LanguageService);
  @Input({ required: true }) itinerary!: Itinerary;
  @Input() places: Place[] = [];
  @Output() openMap = new EventEmitter<Itinerary>();
  @Output() ask = new EventEmitter<Itinerary>();

  get placeNames(): string {
    return this.itinerary.placeIds
      .map((placeId) => this.places.find((place) => place.id === placeId))
      .filter((place): place is Place => Boolean(place))
      .map((place) => this.i18n.localize(place.name))
      .join(', ');
  }
}
