import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { getItineraryProgress, Itinerary } from '../../../core/models/itinerary.model';
import { Place } from '../../../core/models/place.model';
import { AudioGuideService } from '../../../core/services/audio-guide.service';
import {
  ContentExportService,
  type PdfExportSection,
} from '../../../core/services/content-export.service';
import { LanguageService } from '../../../core/services/language.service';
import {
  formatOfflinePackageDate,
  formatOfflinePackageSize,
  OfflineContentService,
} from '../../../core/services/offline-content.service';
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
      <p class="itinerary-progress export-ignore" aria-live="polite">{{ progressLabel }}</p>
      <ul class="itinerary-stops">
        @for (place of itineraryPlaces; track place.id) {
          <li>
            <span>{{ i18n.localize(place.name) }}</span>
            <button
              type="button"
              class="text-button export-ignore"
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
      <div class="actions-row export-ignore">
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
        <button type="button" class="button secondary" (click)="exportPdf()">
          {{ i18n.t('exports.pdf') }}
        </button>
        <button
          type="button"
          class="button secondary"
          [disabled]="offlineContent.activePackageId() !== null && offlineContent.activePackageId() !== offlinePackageId"
          [attr.aria-pressed]="offlineContent.isDownloaded(offlinePackageId)"
          (click)="saveOfflinePackage(offlineContent.isDownloaded(offlinePackageId))"
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
      </div>
      @if (savedOfflinePackage; as offlinePackage) {
        <p class="muted export-ignore" role="status">
          {{
            i18n
              .t('offline.savedInfo')
              .replace('{size}', formatSize(offlinePackage.sizeBytes))
              .replace('{date}', formatDate(offlinePackage.createdAt))
          }}
        </p>
      }
      @if (offlineContent.activePackageId() === offlinePackageId) {
        <p class="muted export-ignore" role="status">{{ offlineContent.progress() }}%</p>
      }
      @if (offlineContent.errorPackageId() === offlinePackageId && offlineContent.error()) {
        <p class="muted export-ignore" role="status">{{ i18n.t('offline.' + offlineContent.error()) }}</p>
      }
      @if (audioGuide.errorContentId() === audioContentId && audioGuide.error()) {
        <p class="muted export-ignore" role="status">{{ i18n.t('audio.' + audioGuide.error()) }}</p>
      }
      @if (exportError()) {
        <p class="muted export-ignore" role="status">{{ i18n.t('exports.failed') }}</p>
      }
    </article>
  `,
})
export class ItineraryCardComponent {
  readonly i18n = inject(LanguageService);
  readonly audioGuide = inject(AudioGuideService);
  readonly offlineContent = inject(OfflineContentService);
  readonly exportError = signal(false);
  private readonly contentExport = inject(ContentExportService);
  readonly visitorPlaces = inject(VisitorPlacesService);
  @Input({ required: true }) itinerary!: Itinerary;
  @Input() places: Place[] = [];
  @Output() openMap = new EventEmitter<Itinerary>();
  @Output() ask = new EventEmitter<Itinerary>();

  get offlinePackageId(): string {
    return `itinerary:${this.itinerary.id}:${this.i18n.currentLanguage()}`;
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

  async saveOfflinePackage(refresh = false): Promise<void> {
    await this.offlineContent.save({
      id: this.offlinePackageId,
      type: 'itinerary',
      title: this.i18n.localize(this.itinerary.title),
      language: this.i18n.currentLanguage(),
      content: { itinerary: this.itinerary, places: this.itineraryPlaces },
      imagePaths: this.itineraryPlaces.map((place) => place.image),
    }, refresh);
  }

  async removeOfflinePackage(): Promise<void> {
    await this.offlineContent.remove(this.offlinePackageId);
  }

  exportPdf(): void {
    try {
      const sections: PdfExportSection[] = [
        {
          text: this.i18n.t(
            this.itinerary.verificationStatus === 'field-verified'
              ? 'itineraries.fieldVerified'
              : 'itineraries.unverified',
          ),
        },
        { text: this.i18n.localize(this.itinerary.shortDescription) },
        { text: this.i18n.localize(this.itinerary.description) },
        {
          heading: this.i18n.t('itineraries.duration'),
          text: this.itinerary.fieldVerification
            ? `${this.itinerary.fieldVerification.durationMinutes} ${this.i18n.t('itineraries.minutes')}`
            : this.i18n.localize(this.itinerary.duration),
        },
        {
          heading: this.i18n.t('itineraries.difficulty'),
          text: this.i18n.localize(
            this.itinerary.fieldVerification?.difficulty ?? this.itinerary.difficulty,
          ),
        },
        {
          heading: this.i18n.t('itineraries.places'),
          text: this.itineraryPlaces
            .map((place) => {
              const details = [
                this.i18n.localize(place.name),
                this.i18n.localize(place.description),
                this.i18n.localize(place.sourceNotes),
                this.i18n.localize(place.imageCredit),
              ].filter(Boolean);
              return details.join('\n');
            })
            .join('\n\n'),
        },
      ];

      if (this.itinerary.fieldVerification) {
        sections.push(
          {
            heading: this.i18n.t('itineraries.distance'),
            text: `${this.itinerary.fieldVerification.distanceMeters} ${this.i18n.t('itineraries.meters')}`,
          },
          {
            heading: this.i18n.t('itineraries.accessibility'),
            text: this.i18n.localize(this.itinerary.fieldVerification.accessibility),
          },
          {
            heading: this.i18n.t('itineraries.fieldVerificationSource'),
            text: this.itinerary.fieldVerification.source,
          },
        );
      }

      this.contentExport.exportPdf(
        { title: this.i18n.localize(this.itinerary.title), sections },
        this.itinerary.id,
      );
      this.exportError.set(false);
    } catch {
      this.exportError.set(true);
    }
  }

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
