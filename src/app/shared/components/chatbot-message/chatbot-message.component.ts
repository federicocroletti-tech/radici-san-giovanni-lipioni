import { Component, Input, inject } from '@angular/core';
import { ChatbotMessage } from '../../../core/models/chatbot.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-chatbot-message',
  template: `
    <article class="chat-message" [class.user]="message.role === 'user'">
      <p>{{ message.text }}</p>
      @if (message.role === 'assistant' && message.citations?.length) {
        <section class="chatbot-citations" [attr.aria-label]="i18n.t('chatbot.citations')">
          <h3>{{ i18n.t('chatbot.citations') }}</h3>
          <ul>
            @for (citation of message.citations; track citation.id) {
              <li>
                @if (citation.url) {
                  <a [href]="citation.url" target="_blank" rel="noopener noreferrer">
                    {{ citation.title }}
                  </a>
                } @else {
                  <strong>{{ citation.title }}</strong>
                }
                <p>{{ citation.creator }} · {{ i18n.t('chatbot.consultedAt') }} {{ citation.consultedAt }}</p>
                <p>{{ citation.citation }}</p>
                @if (citation.claims.length) {
                  <ul>
                    @for (claim of citation.claims; track claim) {
                      <li>{{ claim }}</li>
                    }
                  </ul>
                }
              </li>
            }
          </ul>
        </section>
      }
    </article>
  `,
})
export class ChatbotMessageComponent {
  readonly i18n = inject(LanguageService);
  @Input({ required: true }) message!: ChatbotMessage;
}
