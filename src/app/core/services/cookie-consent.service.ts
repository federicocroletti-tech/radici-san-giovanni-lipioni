import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { CookieConsentPreferences } from '../models/cookie-consent.model';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storageKey = 'radici-cookie-consent';
  private readonly version = '1.0';
  readonly preferences = signal<CookieConsentPreferences | null>(null);

  constructor() {
    if (!this.isBrowser) return;
    afterNextRender(() => this.preferences.set(this.readStoredPreferences()));
  }

  acceptAll(): void {
    this.save({ necessary: true, analytics: true, marketing: true, preferences: true });
  }

  rejectOptional(): void {
    this.save({ necessary: true, analytics: false, marketing: false, preferences: false });
  }

  save(
    values: Pick<CookieConsentPreferences, 'necessary' | 'analytics' | 'marketing' | 'preferences'>,
  ): void {
    const preferences: CookieConsentPreferences = {
      ...values,
      necessary: true,
      updatedAt: new Date().toISOString(),
      version: this.version,
    };

    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    this.preferences.set(preferences);
  }

  reset(): void {
    if (this.isBrowser) localStorage.removeItem(this.storageKey);
    this.preferences.set(null);
  }

  private readStoredPreferences(): CookieConsentPreferences | null {
    if (!this.isBrowser) return null;
    const rawValue = localStorage.getItem(this.storageKey);
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as CookieConsentPreferences;
      return parsed.version === this.version ? parsed : null;
    } catch {
      return null;
    }
  }
}
