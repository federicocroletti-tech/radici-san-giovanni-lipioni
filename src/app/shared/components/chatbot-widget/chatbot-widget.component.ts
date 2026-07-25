import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotMessage } from '../../../core/models/chatbot.model';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { ChatbotUiService } from '../../../core/services/chatbot-ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { ChatbotMessageComponent } from '../chatbot-message/chatbot-message.component';

@Component({
  selector: 'app-chatbot-widget',
  imports: [FormsModule, ChatbotMessageComponent],
  template: `
    <button
      type="button"
      class="chat-fab"
      (click)="ui.toggle()"
      [attr.aria-label]="i18n.t('nav.chatbot')"
    >
      <span aria-hidden="true">?</span>
    </button>

    @if (ui.isOpen()) {
      <section class="chat-panel" aria-live="polite">
        <header>
          <div>
            <h2>{{ i18n.t('chatbot.title') }}</h2>
            <p>{{ i18n.t('chatbot.intro') }}</p>
          </div>
          <button
            type="button"
            class="icon-button"
            (click)="ui.close()"
            [attr.aria-label]="i18n.t('actions.close')"
          >
            ×
          </button>
        </header>

        <div class="chat-log">
          @for (message of messages(); track message.id) {
            <app-chatbot-message [message]="message" />
            @if (message.role === 'assistant' && message.relatedPlaceId) {
              <button
                type="button"
                class="text-button related-place"
                (click)="openRelatedPlace(message.relatedPlaceId)"
              >
                {{ i18n.t('chatbot.openRelatedPlace') }}
              </button>
            }
          }
        </div>

        <form class="chat-form" (ngSubmit)="send()">
          <input
            name="question"
            [(ngModel)]="question"
            [placeholder]="i18n.t('chatbot.placeholder')"
          />
          <button type="submit" class="button small">{{ i18n.t('actions.send') }}</button>
        </form>
      </section>
    }
  `,
})
export class ChatbotWidgetComponent {
  readonly i18n = inject(LanguageService);
  readonly ui = inject(ChatbotUiService);
  private readonly chatbot = inject(ChatbotService);
  private readonly router = inject(Router);
  readonly messages = signal<ChatbotMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: this.i18n.t('chatbot.welcome'),
      createdAt: new Date().toISOString(),
    },
  ]);
  question = '';

  constructor() {
    effect(() => {
      const welcome = this.i18n.t('chatbot.welcome');
      this.messages.update((messages) => [{ ...messages[0], text: welcome }, ...messages.slice(1)]);
    });
  }

  async send(): Promise<void> {
    const text = this.question.trim();
    if (!text) {
      return;
    }

    this.question = '';
    this.messages.update((messages) => [...messages, this.createMessage('user', text)]);
    const response = await this.chatbot.ask(text, this.ui.contextPlaceId());
    this.messages.update((messages) => [
      ...messages,
      this.createMessage('assistant', response.text, response.relatedPlaceId),
    ]);
  }

  openRelatedPlace(placeId: string | undefined): void {
    if (!placeId) {
      return;
    }

    void this.router.navigate(['/esplora'], { queryParams: { place: placeId } });
    this.ui.close();
  }

  private createMessage(
    role: ChatbotMessage['role'],
    text: string,
    relatedPlaceId?: string,
  ): ChatbotMessage {
    return {
      id: crypto.randomUUID(),
      role,
      text,
      relatedPlaceId,
      createdAt: new Date().toISOString(),
    };
  }
}
