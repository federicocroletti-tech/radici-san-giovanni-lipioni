import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Place } from '../../../core/models/place.model';
import { Story } from '../../../core/models/story.model';
import { AudioGuideService } from '../../../core/services/audio-guide.service';
import { ContentExportService } from '../../../core/services/content-export.service';
import { LanguageService } from '../../../core/services/language.service';
import {
  formatOfflinePackageDate,
  formatOfflinePackageSize,
  OfflineContentService,
} from '../../../core/services/offline-content.service';

@Component({
  selector: 'app-story-card',
  template: `
    <article class="content-card story-card">
      <p class="eyebrow">{{ themeLabel }} · {{ i18n.t('stories.mockNotice') }}</p>
      <h2>{{ i18n.localize(story.title) }}</h2>
      <p>{{ i18n.localize(story.excerpt) }}</p>
      <p class="muted">{{ i18n.localize(story.consentRequiredNotice) }}</p>
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
        <button type="button" class="button secondary" (click)="exportPdf()">
          {{ i18n.t('exports.pdf') }}
        </button>
      </div>
      @if (audioGuide.errorContentId() === audioContentId && audioGuide.error()) {
        <p class="muted" role="status">{{ i18n.t('audio.' + audioGuide.error()) }}</p>
      }
      <div class="actions-row">
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
        }
      </div>
      @if (offlineContent.activePackageId() === offlinePackageId) {
        <p class="muted export-ignore" role="status">{{ offlineContent.progress() }}%</p>
      }
      @if (offlineContent.errorPackageId() === offlinePackageId && offlineContent.error()) {
        <p class="muted export-ignore" role="status">{{ i18n.t('offline.' + offlineContent.error()) }}</p>
      }
      @if (exportError()) {
        <p class="muted export-ignore" role="status">{{ i18n.t('exports.failed') }}</p>
      }
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
  readonly audioGuide = inject(AudioGuideService);
  readonly offlineContent = inject(OfflineContentService);
  readonly exportError = signal(false);
  private readonly contentExport = inject(ContentExportService);
  @Input({ required: true }) story!: Story;
  @Input() places: Place[] = [];
  @Output() openPlace = new EventEmitter<string>();

  get audioContentId(): string {
    return `story:${this.story.id}`;
  }

  get offlinePackageId(): string {
    return `story:${this.story.id}:${this.i18n.currentLanguage()}`;
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
      type: 'story',
      title: this.i18n.localize(this.story.title),
      language: this.i18n.currentLanguage(),
      content: { story: this.story, relatedPlaces: this.linkedPlaces },
      imagePaths: this.linkedPlaces.map((place) => place.image),
    }, refresh);
  }

  async removeOfflinePackage(): Promise<void> {
    await this.offlineContent.remove(this.offlinePackageId);
  }

  exportPdf(): void {
    try {
      const title = this.i18n.localize(this.story.title);
      this.contentExport.exportPdf(
        {
          title,
          sections: [
            { text: this.i18n.t('stories.mockNotice') },
            { text: this.i18n.localize(this.story.excerpt) },
            { text: this.i18n.localize(this.story.content) },
            {
              heading: this.i18n.t('stories.linkedPlaces'),
              text: this.linkedPlaces.map((place) => this.i18n.localize(place.name)).join(', '),
            },
            { heading: this.i18n.t('stories.consentNotice'), text: this.i18n.localize(this.story.consentRequiredNotice) },
          ],
        },
        this.story.id,
      );
      this.exportError.set(false);
    } catch {
      this.exportError.set(true);
    }
  }

  toggleAudio(): void {
    const text = [
      this.i18n.localize(this.story.title),
      this.i18n.localize(this.story.content),
    ]
      .filter(Boolean)
      .join('. ');
    this.audioGuide.toggle(this.audioContentId, text, this.i18n.currentLanguage());
  }

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
