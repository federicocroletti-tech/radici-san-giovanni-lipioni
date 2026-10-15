import { Component, ElementRef, effect, inject, signal, ViewChild } from '@angular/core';
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
      [attr.aria-controls]="ui.isOpen() ? 'radici-chat-panel' : null"
      [attr.aria-expanded]="ui.isOpen()"
    >
      <span aria-hidden="true">?</span>
    </button>

    @if (ui.isOpen()) {
      <button
        type="button"
        class="chat-backdrop"
        (click)="ui.close()"
        [attr.aria-label]="i18n.t('actions.close')"
      ></button>
      <section
        id="radici-chat-panel"
        class="chat-panel"
        role="dialog"
        aria-labelledby="radici-chat-title"
        (keydown.escape)="ui.close()"
      >
        <header>
          <div>
            <h2 id="radici-chat-title">{{ i18n.t('chatbot.title') }}</h2>
            <p>{{ i18n.t('chatbot.intro') }}</p>
          </div>
          <div class="chat-header-actions">
            <button
              type="button"
              class="text-button"
              (click)="resetConversation()"
              [disabled]="isBusy()"
            >
              {{ i18n.t('chatbot.newConversation') }}
            </button>
            <button
              type="button"
              class="icon-button"
              (click)="ui.close()"
              [attr.aria-label]="i18n.t('actions.close')"
            >
              ×
            </button>
          </div>
        </header>

        <div class="quick-prompts" [attr.aria-label]="i18n.t('chatbot.suggestions')">
          @for (prompt of i18n.list('chatbot.quickPrompts'); track prompt) {
            <button type="button" class="chip" (click)="send(prompt)" [disabled]="isBusy()">
              {{ prompt }}
            </button>
          }
        </div>

        <div #chatLog class="chat-log" role="log" aria-live="polite" aria-relevant="additions">
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
            @if (message.role === 'assistant') {
              @for (place of relatedPlacesFor(message); track place.id) {
                <button
                  type="button"
                  class="text-button related-place"
                  (click)="openRelatedPlace(place.id)"
                >
                  {{ i18n.t('chatbot.openPlace') }}: {{ place.name }}
                </button>
              }
            }
          }
          @if (isBusy()) {
            <article class="chat-message pending">
              <p>{{ i18n.t('chatbot.thinking') }}</p>
            </article>
          }
        </div>

        <form class="chat-form" (ngSubmit)="send()">
          <input
            name="question"
            [(ngModel)]="question"
            [placeholder]="i18n.t('chatbot.placeholder')"
            [attr.aria-label]="i18n.t('chatbot.inputLabel')"
            autocomplete="off"
            [disabled]="isBusy()"
          />
          <button type="submit" class="button small" [disabled]="isBusy() || !question.trim()">
            {{ i18n.t('actions.send') }}
          </button>
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
  @ViewChild('chatLog') private chatLog?: ElementRef<HTMLDivElement>;
  readonly isBusy = signal(false);
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
      this.messages.update((messages) => {
        const welcomeMessage = messages.find((message) => message.role === 'assistant');
        if (!welcomeMessage) {
          return [this.createMessage('assistant', welcome)];
        }
        return messages.map((message) =>
          message.id === welcomeMessage.id ? { ...message, text: welcome } : message,
        );
      });
    });
  }

  async send(prompt?: string): Promise<void> {
    const text = (prompt ?? this.question).trim();
    if (!text || this.isBusy()) {
      return;
    }

    this.question = '';
    this.isBusy.set(true);
    this.messages.update((messages) => [...messages, this.createMessage('user', text)]);
    try {
      const response = await this.chatbot.ask(text, this.ui.contextPlaceId());
      this.messages.update((messages) => [
        ...messages,
        this.createMessage(
          'assistant',
          response.text,
          response.relatedPlaceId,
          response.relatedPlaces,
        ),
      ]);
    } catch {
      this.messages.update((messages) => [
        ...messages,
        this.createMessage('assistant', this.i18n.t('chatbot.fallback')),
      ]);
    } finally {
      this.isBusy.set(false);
      this.scrollToLatest();
    }
  }

  resetConversation(): void {
    this.question = '';
    this.messages.set([this.createMessage('assistant', this.i18n.t('chatbot.welcome'))]);
  }

  relatedPlacesFor(message: ChatbotMessage): NonNullable<ChatbotMessage['relatedPlaces']> {
    return (message.relatedPlaces ?? []).filter((place) => place.id !== message.relatedPlaceId);
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
    relatedPlaces?: ChatbotMessage['relatedPlaces'],
  ): ChatbotMessage {
    return {
      id: crypto.randomUUID(),
      role,
      text,
      relatedPlaceId,
      relatedPlaces,
      createdAt: new Date().toISOString(),
    };
  }

  private scrollToLatest(): void {
    setTimeout(() => {
      const log = this.chatLog?.nativeElement;
      log?.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
    });
  }
}
