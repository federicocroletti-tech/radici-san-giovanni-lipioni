import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LanguageCode, LocalizedText } from '../models/localized-text.model';

type TranslationDictionary = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'radici-language';
  private readonly dictionary = signal<TranslationDictionary>({});

  readonly availableLanguages: LanguageCode[] = ['it', 'en'];
  readonly currentLanguage = signal<LanguageCode>(this.readStoredLanguage());

  constructor() {
    void this.loadLanguage(this.currentLanguage());
  }

  async setLanguage(language: LanguageCode): Promise<void> {
    await this.loadLanguage(language);
    this.currentLanguage.set(language);
    localStorage.setItem(this.storageKey, language);
    document.documentElement.lang = language;
  }

  t(key: string, fallback = ''): string {
    const value = this.readPath(this.dictionary(), key);
    return typeof value === 'string' ? value : fallback || key;
  }

  list(key: string): string[] {
    const value = this.readPath(this.dictionary(), key);
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  }

  localize(value: LocalizedText | string | undefined): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    const language = this.currentLanguage();
    return value[language] || value.it || value.en || '';
  }

  private async loadLanguage(language: LanguageCode): Promise<void> {
    const dictionary = await firstValueFrom(
      this.http.get<TranslationDictionary>(`assets/i18n/${language}.json`),
    );
    this.dictionary.set(dictionary);
  }

  private readStoredLanguage(): LanguageCode {
    const value = localStorage.getItem(this.storageKey);
    return value === 'en' ? 'en' : 'it';
  }

  private readPath(source: TranslationDictionary, path: string): unknown {
    return path.split('.').reduce<unknown>((current, segment) => {
      if (current && typeof current === 'object' && segment in current) {
        return (current as Record<string, unknown>)[segment];
      }
      return undefined;
    }, source);
  }
}
