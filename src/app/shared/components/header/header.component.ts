import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChatbotUiService } from '../../../core/services/chatbot-ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LanguageSwitcherComponent],
  template: `
    <header class="site-header">
      <a class="brand" routerLink="/" (click)="menuOpen.set(false)">
        <span class="brand-mark" aria-hidden="true">R</span>
        <span>
          <strong>{{ i18n.t('app.name') }}</strong>
          <small>{{ i18n.t('app.tagline') }}</small>
        </span>
      </a>

      <button
        type="button"
        class="icon-button menu-toggle"
        (click)="menuOpen.update((value) => !value)"
        [attr.aria-label]="menuOpen() ? i18n.t('app.closeMenu') : i18n.t('app.openMenu')"
      >
        <span aria-hidden="true">☰</span>
      </button>

      <nav class="main-nav" [class.open]="menuOpen()" aria-label="Primary navigation">
        <a
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="menuOpen.set(false)"
          >{{ i18n.t('nav.home') }}</a
        >
        <a routerLink="/esplora" routerLinkActive="active" (click)="menuOpen.set(false)">{{
          i18n.t('nav.explore')
        }}</a>
        <a routerLink="/itinerari" routerLinkActive="active" (click)="menuOpen.set(false)">{{
          i18n.t('nav.itineraries')
        }}</a>
        <a routerLink="/racconti" routerLinkActive="active" (click)="menuOpen.set(false)">{{
          i18n.t('nav.stories')
        }}</a>
        <app-language-switcher />
        <button type="button" class="button small" (click)="openChat()">
          {{ i18n.t('nav.chatbot') }}
        </button>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  readonly i18n = inject(LanguageService);
  readonly menuOpen = signal(false);
  private readonly chatbotUi = inject(ChatbotUiService);

  openChat(): void {
    this.chatbotUi.open();
    this.menuOpen.set(false);
  }
}
