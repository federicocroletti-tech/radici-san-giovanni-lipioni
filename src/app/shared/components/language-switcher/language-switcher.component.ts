import { Component, inject } from '@angular/core';
import { LanguageCode } from '../../../core/models/localized-text.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  template: `
    <label class="language-switcher">
      <span class="sr-only">{{ i18n.t('language.label', 'Lingua') }}</span>
      <select
        class="language-select"
        [attr.aria-label]="i18n.t('language.label', 'Lingua')"
        [value]="i18n.currentLanguage()"
        (change)="setLanguage($any($event.target).value)"
      >
        @for (language of i18n.availableLanguages; track language) {
          <option [value]="language">{{ languageLabel(language) }}</option>
        }
      </select>
    </label>
  `,
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(LanguageService);

  setLanguage(language: LanguageCode): void {
    void this.i18n.setLanguage(language);
  }

  languageLabel(language: LanguageCode): string {
    const labels: Record<LanguageCode, string> = {
      it: 'Italiano',
      en: 'English',
      fr: 'Français',
    };

    return labels[language];
  }
}
