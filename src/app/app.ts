import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotWidgetComponent } from './shared/components/chatbot-widget/chatbot-widget.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CookieBannerComponent,
    ChatbotWidgetComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
