import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ChatbotUiService } from '../../../core/services/chatbot-ui.service';
import { Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-place-detail-drawer',
  template: `
    @if (place) {
      <aside class="detail-drawer" aria-live="polite">
        <button
          type="button"
          class="icon-button close"
          (click)="closed.emit()"
          [attr.aria-label]="i18n.t('actions.close')"
        >
          ×
        </button>
        <img [src]="place.image" [alt]="i18n.localize(place.alt)" />
        <div class="detail-content">
          <p class="eyebrow">{{ i18n.t('explore.selectedPlace') }}</p>
          <h2>{{ i18n.localize(place.name) }}</h2>
          <p>{{ i18n.localize(place.description) }}</p>
          <p class="status">
            {{
              place.isVerifiedContent ? i18n.t('explore.verified') : i18n.t('explore.notVerified')
            }}
          </p>
        </div>

        <section class="source-panel" aria-label="Source notes">
          <h3>{{ i18n.t('explore.sourceNotes') }}</h3>
          <ul>
            @for (note of place.sourceNotes; track note) {
              <li>{{ note }}</li>
            }
          </ul>
        </section>

        <div class="actions-row">
          <a class="button" [href]="mapsUrl(place)" target="_blank" rel="noopener">{{
            i18n.t('actions.openExternalMap')
          }}</a>
          <button type="button" class="button secondary" (click)="askAbout(place.id)">
            {{ i18n.t('explore.askAboutPlace') }}
          </button>
        </div>
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
  private readonly chatbotUi = inject(ChatbotUiService);
  @Input() place: Place | null = null;
  @Output() closed = new EventEmitter<void>();

  mapsUrl(place: Place): string {
    return `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`;
  }

  askAbout(placeId: string): void {
    this.chatbotUi.open(placeId);
  }
}
