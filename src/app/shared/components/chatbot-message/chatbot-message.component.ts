import { Component, Input } from '@angular/core';
import { ChatbotMessage } from '../../../core/models/chatbot.model';

@Component({
  selector: 'app-chatbot-message',
  template: `
    <article class="chat-message" [class.user]="message.role === 'user'">
      <p>{{ message.text }}</p>
    </article>
  `,
})
export class ChatbotMessageComponent {
  @Input({ required: true }) message!: ChatbotMessage;
}
