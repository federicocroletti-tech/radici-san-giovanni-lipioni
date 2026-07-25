import { Injectable, effect, inject, signal } from '@angular/core';
import { CookieConsentService } from './cookie-consent.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly cookieConsent = inject(CookieConsentService);
  readonly analyticsEnabled = signal(false);

  constructor() {
    effect(() => {
      this.analyticsEnabled.set(Boolean(this.cookieConsent.preferences()?.analytics));
    });
  }

  trackPageView(_path: string): void {
    if (!this.analyticsEnabled()) {
      return;
    }
  }
}
