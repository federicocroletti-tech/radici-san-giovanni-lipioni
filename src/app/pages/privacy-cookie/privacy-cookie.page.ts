import { Component, inject } from '@angular/core';
import { CookieConsentService } from '../../core/services/cookie-consent.service';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-privacy-cookie-page',
  template: `
    <section class="page-heading">
      <h1>{{ i18n.t('privacy.title') }}</h1>
      <p>{{ i18n.t('privacy.intro') }}</p>
      <button type="button" class="button" (click)="cookies.reset()">
        {{ i18n.t('actions.manageCookies') }}
      </button>
    </section>

    <section class="section prose">
      @for (section of i18n.list('privacy.sections'); track section) {
        <p>{{ section }}</p>
      }
    </section>
  `,
})
export class PrivacyCookiePage {
  readonly i18n = inject(LanguageService);
  readonly cookies = inject(CookieConsentService);

  constructor() {
    inject(SeoService).usePage('privacy');
  }
}
