import { DOCUMENT } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  inject,
  signal,
} from '@angular/core';
import { AudioGuideService } from '../../../core/services/audio-guide.service';
import { ChatbotUiService } from '../../../core/services/chatbot-ui.service';
import { hasPlaceCoordinates, Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';
import {
  formatOfflinePackageDate,
  formatOfflinePackageSize,
  OfflineContentService,
} from '../../../core/services/offline-content.service';
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
        <img
          [src]="offlineImageSrc() || place.image"
          [alt]="i18n.localize(place.alt)"
          loading="lazy"
          decoding="async"
        />
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
          <button
            type="button"
            class="button secondary"
            [disabled]="offlineContent.activePackageId() !== null && offlineContent.activePackageId() !== offlinePackageId"
            [attr.aria-pressed]="offlineContent.isDownloaded(offlinePackageId)"
            (click)="saveOfflinePackage(place, offlineContent.isDownloaded(offlinePackageId))"
          >
            {{
              i18n.t(
                offlineContent.activePackageId() === offlinePackageId
                  ? 'offline.downloading'
                  : offlineContent.isDownloaded(offlinePackageId)
                    ? 'offline.update'
                    : 'offline.download'
              )
            }}
          </button>
          @if (offlineContent.isDownloaded(offlinePackageId)) {
            <button type="button" class="button secondary" (click)="removeOfflinePackage()">
              {{ i18n.t('offline.remove') }}
            </button>
          }
          <button type="button" class="button secondary" (click)="share(place)">
            {{ i18n.t('actions.share') }}
          </button>
          <button
            type="button"
            class="button secondary"
            [attr.aria-pressed]="audioGuide.activeContentId() === audioContentId"
            (click)="toggleAudioGuide(place)"
          >
            {{
              i18n.t(
                audioGuide.activeContentId() === audioContentId
                  ? 'audio.stop'
                  : 'audio.listenGuide'
              )
            }}
          </button>
          <button type="button" class="button secondary" (click)="askAbout(place.id)">
            {{ i18n.t('explore.askAboutPlace') }}
          </button>
        </div>
        @if (savedOfflinePackage; as offlinePackage) {
          <p class="muted" role="status">
            {{
              i18n
                .t('offline.savedInfo')
                .replace('{size}', formatSize(offlinePackage.sizeBytes))
                .replace('{date}', formatDate(offlinePackage.createdAt))
            }}
          </p>
        }
        @if (offlineContent.activePackageId() === offlinePackageId) {
          <p class="muted" role="status">{{ offlineContent.progress() }}%</p>
        }
        @if (offlineContent.errorPackageId() === offlinePackageId && offlineContent.error()) {
          <p class="muted" role="status">{{ i18n.t('offline.' + offlineContent.error()) }}</p>
        }
        @if (audioGuide.errorContentId() === audioContentId && audioGuide.error()) {
          <p class="muted" role="status">{{ i18n.t('audio.' + audioGuide.error()) }}</p>
        }
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
export class PlaceDetailDrawerComponent implements OnChanges, OnDestroy {
  readonly i18n = inject(LanguageService);
  readonly audioGuide = inject(AudioGuideService);
  readonly offlineContent = inject(OfflineContentService);
  readonly visitorPlaces = inject(VisitorPlacesService);
  private readonly chatbotUi = inject(ChatbotUiService);
  private readonly document = inject(DOCUMENT);
  readonly shareStatus = signal('');
  readonly offlineImageSrc = signal('');
  @Input() place: Place | null = null;
  @Input() relatedPlaces: Place[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() placeSelected = new EventEmitter<Place>();

  get offlinePackageId(): string {
    return this.place ? `place:${this.place.id}:${this.i18n.currentLanguage()}` : '';
  }

  ngOnChanges(): void {
    this.releaseOfflineImageUrl();
    this.offlineImageSrc.set('');
    const imagePath = this.place?.image;
    if (!imagePath) {
      this.offlineImageSrc.set('');
      return;
    }

    void this.offlineContent
      .resolveImagePath(imagePath)
      .then((imageUrl) => {
        if (this.place?.image === imagePath) this.offlineImageSrc.set(imageUrl);
      })
      .catch(() => {
        if (this.place?.image === imagePath) this.offlineImageSrc.set(imagePath);
      });
  }

  ngOnDestroy(): void {
    this.releaseOfflineImageUrl();
  }

  get savedOfflinePackage() {
    return this.offlineContent.getPackage(this.offlinePackageId);
  }

  formatSize(sizeBytes: number): string {
    return formatOfflinePackageSize(sizeBytes);
  }

  formatDate(createdAt: string): string {
    return formatOfflinePackageDate(createdAt, this.i18n.currentLanguage());
  }

  async saveOfflinePackage(place: Place, refresh = false): Promise<void> {
    await this.offlineContent.save({
      id: this.offlinePackageId,
      type: 'place',
      title: this.i18n.localize(place.name),
      language: this.i18n.currentLanguage(),
      content: place,
      imagePaths: [place.image],
    }, refresh);
  }

  async removeOfflinePackage(): Promise<void> {
    await this.offlineContent.remove(this.offlinePackageId);
  }

  get audioContentId(): string {
    return this.place ? `place:${this.place.id}` : '';
  }

  toggleAudioGuide(place: Place): void {
    const text = [this.i18n.localize(place.name), this.i18n.localize(place.description)]
      .filter(Boolean)
      .join('. ');
    this.audioGuide.toggle(`place:${place.id}`, text, this.i18n.currentLanguage());
  }

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

  private releaseOfflineImageUrl(): void {
    const currentUrl = this.offlineImageSrc();
    if (currentUrl.startsWith('blob:')) URL.revokeObjectURL(currentUrl);
  }
}
