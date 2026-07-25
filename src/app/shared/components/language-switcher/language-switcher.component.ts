import { Component, inject } from '@angular/core';
import { LanguageCode } from '../../../core/models/localized-text.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div class="language-switcher" aria-label="Language selector">
      @for (language of i18n.availableLanguages; track language) {
        <button
          type="button"
          class="language-button"
          [class.active]="i18n.currentLanguage() === language"
          [attr.aria-pressed]="i18n.currentLanguage() === language"
          (click)="setLanguage(language)"
        >
          {{ language.toUpperCase() }}
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(LanguageService);

  setLanguage(language: LanguageCode): void {
    void this.i18n.setLanguage(language);
  }
}
