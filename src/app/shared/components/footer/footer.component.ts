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
        <p class="muted">
          {{ i18n.t('footer.rights') }}
          <a href="https://federico-croletti-site.onrender.com" target="_blank" rel="noopener">
            Federico Croletti
          </a>
        </p>
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
      <a
        class="repository-link"
        href="https://github.com/federicocroletti-tech/radici-san-giovanni-lipioni"
        target="_blank"
        rel="noopener"
      >
        {{ i18n.t('footer.repository') }}
      </a>
    </footer>
  `,
})
export class FooterComponent {
  readonly i18n = inject(LanguageService);
  readonly cookies = inject(CookieConsentService);
}
