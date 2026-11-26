import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { getItineraryProgress, Itinerary } from '../../../core/models/itinerary.model';
import { Place } from '../../../core/models/place.model';
import { AudioGuideService } from '../../../core/services/audio-guide.service';
import { LanguageService } from '../../../core/services/language.service';
import { VisitorPlacesService } from '../../../core/services/visitor-places.service';

@Component({
  selector: 'app-itinerary-card',
  template: `
    <article class="content-card itinerary-card">
      <p class="eyebrow">
        {{ i18n.t(itinerary.fieldVerification ? 'itineraries.duration' : 'itineraries.estimatedDuration') }}:
        @if (itinerary.fieldVerification; as verification) {
          {{ verification.durationMinutes }} {{ i18n.t('itineraries.minutes') }}
        } @else {
          {{ i18n.localize(itinerary.duration) }}
        }
      </p>
      <p class="verification-status" role="note">
        {{
          i18n.t(
            itinerary.verificationStatus === 'field-verified'
              ? 'itineraries.fieldVerified'
              : 'itineraries.unverified'
          )
        }}
      </p>
      <h2>{{ i18n.localize(itinerary.title) }}</h2>
      <p>{{ i18n.localize(itinerary.shortDescription) }}</p>
      <p>{{ i18n.localize(itinerary.description) }}</p>
      <dl>
        <div>
          <dt>{{ i18n.t('itineraries.difficulty') }}</dt>
          <dd>
            {{
              i18n.localize(itinerary.fieldVerification?.difficulty ?? itinerary.difficulty)
            }}
          </dd>
        </div>
        <div>
          <dt>{{ i18n.t('itineraries.places') }}</dt>
          <dd>{{ placeNames }}</dd>
        </div>
        @if (itinerary.fieldVerification; as verification) {
          <div>
            <dt>{{ i18n.t('itineraries.distance') }}</dt>
            <dd>{{ verification.distanceMeters }} {{ i18n.t('itineraries.meters') }}</dd>
          </div>
          <div>
            <dt>{{ i18n.t('itineraries.accessibility') }}</dt>
            <dd>{{ i18n.localize(verification.accessibility) }}</dd>
          </div>
          <div>
            <dt>{{ i18n.t('itineraries.fieldVerifiedAt') }}</dt>
            <dd><time [attr.datetime]="verification.verifiedAt">{{ verification.verifiedAt }}</time></dd>
          </div>
          <div>
            <dt>{{ i18n.t('itineraries.fieldVerificationSource') }}</dt>
            <dd>{{ verification.source }}</dd>
          </div>
        }
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
              [attr.aria-label]="
                i18n.t(
                  visitorPlaces.isVisited(place.id)
                    ? 'actions.markUnvisited'
                    : 'actions.markVisited'
                ) + ': ' + i18n.localize(place.name)
              "
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
        <button
          type="button"
          class="button secondary"
          [attr.aria-pressed]="audioGuide.activeContentId() === audioContentId"
          (click)="toggleAudio()"
        >
          {{
            i18n.t(
              audioGuide.activeContentId() === audioContentId ? 'audio.stop' : 'audio.listen'
            )
          }}
        </button>
        <button type="button" class="button" (click)="openMap.emit(itinerary)">
          {{ i18n.t('itineraries.openMap') }}
        </button>
        <button type="button" class="button secondary" (click)="ask.emit(itinerary)">
          {{ i18n.t('itineraries.ask') }}
        </button>
      </div>
      @if (audioGuide.errorContentId() === audioContentId && audioGuide.error()) {
        <p class="muted" role="status">{{ i18n.t('audio.' + audioGuide.error()) }}</p>
      }
    </article>
  `,
})
export class ItineraryCardComponent {
  readonly i18n = inject(LanguageService);
  readonly audioGuide = inject(AudioGuideService);
  readonly visitorPlaces = inject(VisitorPlacesService);
  @Input({ required: true }) itinerary!: Itinerary;
  @Input() places: Place[] = [];
  @Output() openMap = new EventEmitter<Itinerary>();
  @Output() ask = new EventEmitter<Itinerary>();

  get audioContentId(): string {
    return `itinerary:${this.itinerary.id}`;
  }

  toggleAudio(): void {
    const text = [
      this.i18n.localize(this.itinerary.title),
      this.i18n.localize(this.itinerary.description),
      ...this.itineraryPlaces.map((place) => this.i18n.localize(place.name)),
    ]
      .filter(Boolean)
      .join('. ');
    this.audioGuide.toggle(this.audioContentId, text, this.i18n.currentLanguage());
  }

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
