import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '../../../core/services/cookie-consent.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div>
        <strong>{{ i18n.t('app.name') }}</strong>
        <p>{{ i18n.t('footer.description') }}</p>
        <p class="muted">{{ i18n.t('footer.disclaimer') }}</p>
      </div>
      <nav aria-label="Footer navigation">
        <a routerLink="/">{{ i18n.t('nav.home') }}</a>
        <a routerLink="/esplora">{{ i18n.t('nav.explore') }}</a>
        <a routerLink="/itinerari">{{ i18n.t('nav.itineraries') }}</a>
        <a routerLink="/racconti">{{ i18n.t('nav.stories') }}</a>
        <a routerLink="/privacy-cookie">{{ i18n.t('nav.privacy') }}</a>
        <button type="button" class="text-button" (click)="cookies.reset()">
          {{ i18n.t('actions.manageCookies') }}
        </button>
      </nav>
      <p class="muted">{{ i18n.t('footer.repository') }}</p>
    </footer>
  `,
})
export class FooterComponent {
  readonly i18n = inject(LanguageService);
  readonly cookies = inject(CookieConsentService);
}
