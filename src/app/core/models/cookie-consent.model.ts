export interface CookieConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  updatedAt: string;
  version: string;
}

export type CookieConsentCategory = keyof Omit<CookieConsentPreferences, 'updatedAt' | 'version'>;
