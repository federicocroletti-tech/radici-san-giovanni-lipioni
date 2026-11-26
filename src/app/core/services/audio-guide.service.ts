import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { LanguageCode } from '../models/localized-text.model';

export type AudioGuideError = 'unavailable' | 'failed' | 'empty';

const VOICE_LANGUAGES: Record<LanguageCode, string> = {
  it: 'it-IT',
  en: 'en-US',
  fr: 'fr-FR',
};

@Injectable({ providedIn: 'root' })
export class AudioGuideService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  readonly activeContentId = signal<string | null>(null);
  readonly errorContentId = signal<string | null>(null);
  readonly error = signal<AudioGuideError | null>(null);

  toggle(contentId: string, text: string, language: LanguageCode): void {
    if (this.activeContentId() === contentId) {
      this.stop();
      return;
    }

    this.stop();

    const view = this.isBrowser ? this.document.defaultView : null;
    const synthesis = view?.speechSynthesis;
    const Utterance = view?.SpeechSynthesisUtterance;

    if (!synthesis || !Utterance) {
      this.setError(contentId, 'unavailable');
      return;
    }

    const cleanText = text.trim();
    if (!cleanText) {
      this.setError(contentId, 'empty');
      return;
    }

    const utterance = new Utterance(cleanText);
    utterance.lang = VOICE_LANGUAGES[language];
    utterance.onend = () => this.clearIfCurrent(utterance);
    utterance.onerror = () => {
      if (this.currentUtterance !== utterance) return;
      this.setError(contentId, 'failed');
      this.clearIfCurrent(utterance);
    };

    this.currentUtterance = utterance;
    this.activeContentId.set(contentId);
    this.error.set(null);
    this.errorContentId.set(null);

    try {
      synthesis.speak(utterance);
    } catch {
      this.setError(contentId, 'failed');
      this.clearIfCurrent(utterance);
    }
  }

  stop(): void {
    const view = this.isBrowser ? this.document.defaultView : null;
    this.currentUtterance = null;
    this.activeContentId.set(null);
    this.error.set(null);
    this.errorContentId.set(null);
    view?.speechSynthesis?.cancel();
  }

  private setError(contentId: string, error: AudioGuideError): void {
    this.errorContentId.set(contentId);
    this.error.set(error);
  }

  private clearIfCurrent(utterance: SpeechSynthesisUtterance): void {
    if (this.currentUtterance !== utterance) return;
    this.currentUtterance = null;
    this.activeContentId.set(null);
  }
}
