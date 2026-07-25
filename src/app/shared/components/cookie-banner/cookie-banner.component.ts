import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieConsentService } from '../../../core/services/cookie-consent.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-cookie-banner',
  imports: [FormsModule],
  template: `
    @if (!cookies.preferences()) {
      <section class="cookie-banner" aria-live="polite">
        <div>
          <h2>{{ i18n.t('cookie.title') }}</h2>
          <p>{{ i18n.t('cookie.intro') }}</p>
        </div>

        @if (customizing()) {
          <div class="cookie-grid">
            <label class="check-row"
              ><input type="checkbox" checked disabled />
              <span
                ><strong>{{ i18n.t('cookie.necessary') }}</strong
                >{{ i18n.t('cookie.necessaryText') }}</span
              ></label
            >
            <label class="check-row"
              ><input type="checkbox" [(ngModel)]="analytics" />
              <span
                ><strong>{{ i18n.t('cookie.analytics') }}</strong
                >{{ i18n.t('cookie.analyticsText') }}</span
              ></label
            >
            <label class="check-row"
              ><input type="checkbox" [(ngModel)]="marketing" />
              <span
                ><strong>{{ i18n.t('cookie.marketing') }}</strong
                >{{ i18n.t('cookie.marketingText') }}</span
              ></label
            >
            <label class="check-row"
              ><input type="checkbox" [(ngModel)]="preferences" />
              <span
                ><strong>{{ i18n.t('cookie.preferences') }}</strong
                >{{ i18n.t('cookie.preferencesText') }}</span
              ></label
            >
          </div>
        }

        <div class="actions-row">
          <button type="button" class="button" (click)="cookies.acceptAll()">
            {{ i18n.t('actions.acceptAll') }}
          </button>
          <button type="button" class="button secondary" (click)="cookies.rejectOptional()">
            {{ i18n.t('actions.rejectAll') }}
          </button>
          @if (customizing()) {
            <button type="button" class="button secondary" (click)="save()">
              {{ i18n.t('actions.savePreferences') }}
            </button>
          } @else {
            <button type="button" class="text-button" (click)="customizing.set(true)">
              {{ i18n.t('actions.manageCookies') }}
            </button>
          }
        </div>
      </section>
    }
  `,
})
export class CookieBannerComponent {
  readonly i18n = inject(LanguageService);
  readonly cookies = inject(CookieConsentService);
  readonly customizing = signal(false);
  analytics = false;
  marketing = false;
  preferences = false;

  save(): void {
    this.cookies.save({
      necessary: true,
      analytics: this.analytics,
      marketing: this.marketing,
      preferences: this.preferences,
    });
  }
}
