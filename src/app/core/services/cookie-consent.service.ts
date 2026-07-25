import { Injectable, signal } from '@angular/core';
import { CookieConsentPreferences } from '../models/cookie-consent.model';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly storageKey = 'radici-cookie-consent';
  private readonly version = '1.0';
  readonly preferences = signal<CookieConsentPreferences | null>(this.readStoredPreferences());

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

    localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    this.preferences.set(preferences);
  }

  reset(): void {
    localStorage.removeItem(this.storageKey);
    this.preferences.set(null);
  }

  private readStoredPreferences(): CookieConsentPreferences | null {
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
