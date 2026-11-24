import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { getItineraryProgress, Itinerary } from '../../../core/models/itinerary.model';
import { Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';
import { VisitorPlacesService } from '../../../core/services/visitor-places.service';

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
      <p class="itinerary-progress" aria-live="polite">{{ progressLabel }}</p>
      <ul class="itinerary-stops">
        @for (place of itineraryPlaces; track place.id) {
          <li>
            <span>{{ i18n.localize(place.name) }}</span>
            <button
              type="button"
              class="text-button"
              [attr.aria-pressed]="visitorPlaces.isVisited(place.id)"
              (click)="visitorPlaces.toggleVisited(place.id)"
            >
              {{
                i18n.t(
                  visitorPlaces.isVisited(place.id)
                    ? 'actions.markUnvisited'
                    : 'actions.markVisited'
                )
              }}
            </button>
          </li>
        }
      </ul>
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
  readonly visitorPlaces = inject(VisitorPlacesService);
  @Input({ required: true }) itinerary!: Itinerary;
  @Input() places: Place[] = [];
  @Output() openMap = new EventEmitter<Itinerary>();
  @Output() ask = new EventEmitter<Itinerary>();

  get itineraryPlaces(): Place[] {
    return this.itinerary.placeIds
      .map((placeId) => this.places.find((place) => place.id === placeId))
      .filter((place): place is Place => Boolean(place));
  }

  get placeNames(): string {
    return this.itineraryPlaces.map((place) => this.i18n.localize(place.name)).join(', ');
  }

  get progressLabel(): string {
    const progress = getItineraryProgress(this.itinerary.placeIds, this.visitorPlaces.visited());
    return this.i18n
      .t('itineraries.progress')
      .replace('{completed}', String(progress.completed))
      .replace('{total}', String(progress.total));
  }
}
