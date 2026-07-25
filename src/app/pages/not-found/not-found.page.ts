import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="page-heading not-found">
      <p class="eyebrow">404</p>
      <h1>{{ i18n.t('notFound.title') }}</h1>
      <p>{{ i18n.t('notFound.text') }}</p>
      <div class="actions-row">
        <a class="button" routerLink="/">{{ i18n.t('actions.backHome') }}</a>
        <a class="button secondary" routerLink="/esplora">{{ i18n.t('actions.exploreMap') }}</a>
      </div>
    </section>
  `,
})
export class NotFoundPage {
  readonly i18n = inject(LanguageService);

  constructor() {
    inject(SeoService).usePage('notFound');
  }
}
