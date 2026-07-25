import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Place } from '../../core/models/place.model';
import { ChatbotUiService } from '../../core/services/chatbot-ui.service';
import { LanguageService } from '../../core/services/language.service';
import { PlacesService } from '../../core/services/places.service';
import { SeoService } from '../../core/services/seo.service';
import { PlaceCardComponent } from '../../shared/components/place-card/place-card.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, PlaceCardComponent],
  template: `
    <section class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">{{ i18n.t('home.kicker') }}</p>
        <h1>{{ i18n.t('home.title') }}</h1>
        <p>{{ i18n.t('home.intro') }}</p>
        <div class="actions-row">
          <a class="button" routerLink="/esplora">{{ i18n.t('actions.exploreMap') }}</a>
          <button type="button" class="button secondary" (click)="chatbot.open()">
            {{ i18n.t('actions.askChatbot') }}
          </button>
        </div>
      </div>
      <img class="hero-image" src="assets/images/borgo-stone.svg" [alt]="i18n.t('home.title')" />
    </section>

    <section class="section two-column">
      <div>
        <p class="eyebrow">{{ i18n.t('app.demoNotice') }}</p>
        <h2>{{ i18n.t('home.whyTitle') }}</h2>
      </div>
      <p>{{ i18n.t('home.whyText') }}</p>
    </section>

    <section class="section">
      <h2>{{ i18n.t('home.cardsTitle') }}</h2>
      <div class="feature-grid">
        <article class="content-card">
          <h3>{{ i18n.t('home.placesTitle') }}</h3>
          <p>{{ i18n.t('home.placesText') }}</p>
        </article>
        <article class="content-card">
          <h3>{{ i18n.t('home.itinerariesTitle') }}</h3>
          <p>{{ i18n.t('home.itinerariesText') }}</p>
        </article>
        <article class="content-card">
          <h3>{{ i18n.t('home.storiesTitle') }}</h3>
          <p>{{ i18n.t('home.storiesText') }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <h2>{{ i18n.t('home.featuredTitle') }}</h2>
      <div class="place-grid">
        @for (place of featuredPlaces(); track place.id) {
          <app-place-card [place]="place" (selectedPlace)="openPlace(place)" />
        }
      </div>
    </section>

    <section class="section callout-band">
      <div>
        <h2>{{ i18n.t('home.rootsTitle') }}</h2>
        <p>{{ i18n.t('home.rootsText') }}</p>
      </div>
      <div>
        <h2>{{ i18n.t('home.finalCtaTitle') }}</h2>
        <p>{{ i18n.t('home.finalCtaText') }}</p>
        <a class="button" routerLink="/esplora">{{ i18n.t('actions.exploreMap') }}</a>
      </div>
    </section>
  `,
})
export class HomePage {
  readonly i18n = inject(LanguageService);
  readonly chatbot = inject(ChatbotUiService);
  readonly featuredPlaces = signal<Place[]>([]);
  private readonly placesService = inject(PlacesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  constructor() {
    inject(SeoService).usePage('home');
    this.placesService
      .getPlaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((places) => this.featuredPlaces.set(places.slice(0, 3)));
  }

  openPlace(place: Place): void {
    void this.router.navigate(['/esplora'], { queryParams: { place: place.id } });
  }
}
