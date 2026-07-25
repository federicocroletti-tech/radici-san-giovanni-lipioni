import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatbotUiService {
  readonly isOpen = signal(false);
  readonly contextPlaceId = signal<string | null>(null);

  open(contextPlaceId?: string): void {
    if (contextPlaceId) {
      this.contextPlaceId.set(contextPlaceId);
    }
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((value) => !value);
  }
}
