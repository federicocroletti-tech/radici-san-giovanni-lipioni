import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { ChatbotUiService } from '../../../core/services/chatbot-ui.service';
import { hasPlaceCoordinates, Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';
import { VisitorPlacesService } from '../../../core/services/visitor-places.service';

@Component({
  selector: 'app-place-detail-drawer',
  template: `
    @if (place) {
      <aside
        class="detail-drawer"
        role="region"
        [attr.aria-label]="i18n.localize(place.name)"
        aria-live="polite"
      >
        <button
          type="button"
          class="icon-button close"
          (click)="closed.emit()"
          [attr.aria-label]="i18n.t('actions.close')"
        >
          ×
        </button>
        <img [src]="place.image" [alt]="i18n.localize(place.alt)" loading="lazy" decoding="async" />
        @if (place.imageCredit) {
          <small class="image-credit">
            {{ i18n.localize(place.imageCredit) }}
            @if (place.imageSourceUrl) {
              <a [href]="place.imageSourceUrl" target="_blank" rel="noopener noreferrer">
                {{ i18n.t('explore.imageSource') }}
              </a>
            }
            @if (place.imageLicenseUrl) {
              <a [href]="place.imageLicenseUrl" target="_blank" rel="noopener noreferrer">
                {{ i18n.t('explore.imageLicense') }}
              </a>
            }
          </small>
        }
        <div class="detail-content">
          <p class="eyebrow">{{ i18n.t('explore.selectedPlace') }}</p>
          <h2>{{ i18n.localize(place.name) }}</h2>
          <p>{{ i18n.localize(place.description) }}</p>
          <dl class="metadata-grid">
            <div>
              <dt>{{ i18n.t('explore.coordinates') }}</dt>
              <dd>{{ coordinates(place) }}</dd>
            </div>
            @if (hasPlaceCoordinates(place)) {
              <div>
                <dt>{{ i18n.t('explore.coordinateVerification') }}</dt>
                <dd>
                  {{ coordinateSourceLabel(place) }}; {{ coordinateVerificationLabel(place) }}
                  @if (place.coordinateStatus === 'field-verified' && place.coordinateVerifiedAt) {
                    <time [attr.datetime]="place.coordinateVerifiedAt">
                      {{ place.coordinateVerifiedAt }}
                    </time>
                  }
                </dd>
              </div>
            }
            <div>
              <dt>{{ i18n.t('explore.sourceStatus') }}</dt>
              <dd class="status">{{ sourceLabel(place) }}</dd>
            </div>
          </dl>
          <section class="detail-section">
            <h3>{{ i18n.t('explore.historicalInterest') }}</h3>
            <p>{{ detailText(place.historicalInterest) }}</p>
          </section>
          <section class="detail-section">
            <h3>{{ i18n.t('explore.architecturalInterest') }}</h3>
            <p>{{ detailText(place.architecturalInterest) }}</p>
          </section>
          <section class="detail-section">
            <h3>{{ i18n.t('explore.landscapeInterest') }}</h3>
            <p>{{ detailText(place.landscapeInterest) }}</p>
          </section>
          <section class="detail-section">
            <h3>{{ i18n.t('explore.curiosity') }}</h3>
            <p>{{ detailText(place.curiosity) }}</p>
          </section>
          <section class="detail-section">
            <h3>{{ i18n.t('explore.sourceNotes') }}</h3>
            <p>{{ detailText(place.sourceNotes) }}</p>
          </section>
          @if (relatedPlaces.length) {
            <section class="detail-section">
              <h3>{{ i18n.t('explore.relatedPlaces') }}</h3>
              <div class="chips">
                @for (relatedPlace of relatedPlaces; track relatedPlace.id) {
                  <button type="button" class="chip" (click)="placeSelected.emit(relatedPlace)">
                    {{ i18n.localize(relatedPlace.name) }}
                  </button>
                }
              </div>
            </section>
          }
        </div>

        <div class="actions-row">
          @if (mapsUrl(place); as mapUrl) {
            <a class="button" [href]="mapUrl" target="_blank" rel="noopener">
              {{ i18n.t('actions.openExternalMap') }}
            </a>
          }
          @if (directionsUrl(place); as url) {
            <a class="button" [href]="url" target="_blank" rel="noopener">
              {{ i18n.t('actions.directions') }}
            </a>
          }
          <button
            type="button"
            class="button secondary"
            [attr.aria-pressed]="visitorPlaces.isFavorite(place.id)"
            (click)="visitorPlaces.toggleFavorite(place.id)"
          >
            {{
              i18n.t(
                visitorPlaces.isFavorite(place.id)
                  ? 'actions.removeSavedPlace'
                  : 'actions.savePlace'
              )
            }}
          </button>
          <button
            type="button"
            class="button secondary"
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
          <button type="button" class="button secondary" (click)="share(place)">
            {{ i18n.t('actions.share') }}
          </button>
          <button type="button" class="button secondary" (click)="askAbout(place.id)">
            {{ i18n.t('explore.askAboutPlace') }}
          </button>
        </div>
        @if (shareStatus()) {
          <p class="muted" role="status">{{ i18n.t(shareStatus()) }}</p>
        }
      </aside>
    } @else {
      <aside class="detail-drawer detail-empty" aria-live="polite">
        <p class="eyebrow">{{ i18n.t('explore.selectedPlace') }}</p>
        <h2>{{ i18n.t('explore.selectPromptTitle') }}</h2>
        <p>{{ i18n.t('explore.selectPromptText') }}</p>
      </aside>
    }
  `,
})
export class PlaceDetailDrawerComponent {
  readonly i18n = inject(LanguageService);
  readonly visitorPlaces = inject(VisitorPlacesService);
  private readonly chatbotUi = inject(ChatbotUiService);
  private readonly document = inject(DOCUMENT);
  readonly shareStatus = signal('');
  @Input() place: Place | null = null;
  @Input() relatedPlaces: Place[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() placeSelected = new EventEmitter<Place>();

  mapsUrl(place: Place): string | null {
    if (!hasPlaceCoordinates(place)) {
      return null;
    }

    return `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`;
  }

  directionsUrl(place: Place): string | null {
    if (!hasPlaceCoordinates(place)) {
      return null;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  }

  async share(place: Place): Promise<void> {
    const windowRef = this.document.defaultView;
    if (!windowRef) {
      this.shareStatus.set('actions.shareUnavailable');
      return;
    }

    const url = new URL('/esplora', windowRef.location.origin);
    url.searchParams.set('place', place.id);
    url.searchParams.set('view', 'map');

    try {
      if (windowRef.navigator.share) {
        await windowRef.navigator.share({
          title: this.i18n.localize(place.name),
          url: url.toString(),
        });
        this.shareStatus.set('');
      } else if (windowRef.navigator.clipboard?.writeText) {
        await windowRef.navigator.clipboard.writeText(url.toString());
        this.shareStatus.set('actions.linkCopied');
      } else {
        this.shareStatus.set('actions.shareUnavailable');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      this.shareStatus.set('actions.shareFailed');
    }
  }

  coordinates(place: Place): string {
    if (!hasPlaceCoordinates(place)) {
      return this.i18n.t('explore.coordinatesUnavailable');
    }

    return `${place.latitude.toFixed(6)}, ${place.longitude.toFixed(6)}`;
  }

  hasPlaceCoordinates(place: Place): boolean {
    return hasPlaceCoordinates(place);
  }

  coordinateVerificationLabel(place: Place): string {
    if (place.coordinateStatus === 'field-verified') {
      return this.i18n.t('explore.coordinatesFieldVerified');
    }

    return this.i18n.t('explore.coordinatesOsmUnverified');
  }

  coordinateSourceLabel(place: Place): string {
    return place.coordinateSource || this.i18n.t('explore.coordinateSourceUnavailable');
  }

  sourceLabel(place: Place): string {
    const status = place.sourceStatus ?? (place.isVerifiedContent ? 'verified' : 'to-verify');
    return this.i18n.t(`sourceStatus.${status}`);
  }

  detailText(value: Place['historicalInterest']): string {
    return this.i18n.localize(value) || this.i18n.t('explore.informationToVerify');
  }

  askAbout(placeId: string): void {
    this.chatbotUi.open(placeId);
  }
}
