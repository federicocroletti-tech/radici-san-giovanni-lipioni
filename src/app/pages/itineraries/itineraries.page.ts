import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Itinerary } from '../../core/models/itinerary.model';
import { Place } from '../../core/models/place.model';
import { ChatbotUiService } from '../../core/services/chatbot-ui.service';
import { ItinerariesService } from '../../core/services/itineraries.service';
import { LanguageService } from '../../core/services/language.service';
import { PlacesService } from '../../core/services/places.service';
import { SeoService } from '../../core/services/seo.service';
import { ItineraryCardComponent } from '../../shared/components/itinerary-card/itinerary-card.component';

@Component({
  selector: 'app-itineraries-page',
  imports: [ItineraryCardComponent],
  template: `
    <section class="page-heading">
      <p class="eyebrow">{{ i18n.t('app.demoNotice') }}</p>
      <h1>{{ i18n.t('itineraries.title') }}</h1>
      <p>{{ i18n.t('itineraries.intro') }}</p>
    </section>

    <section class="card-list">
      @for (itinerary of itineraries(); track itinerary.id) {
        <app-itinerary-card
          [itinerary]="itinerary"
          [places]="places()"
          (openMap)="openMap($event)"
          (ask)="ask($event)"
        />
      }
    </section>
  `,
})
export class ItinerariesPage {
  readonly i18n = inject(LanguageService);
  readonly itineraries = signal<Itinerary[]>([]);
  readonly places = signal<Place[]>([]);
  private readonly router = inject(Router);
  private readonly chatbotUi = inject(ChatbotUiService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    inject(SeoService).usePage('itineraries');
    inject(ItinerariesService)
      .getItineraries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((itineraries) => this.itineraries.set(itineraries));
    inject(PlacesService)
      .getPlaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((places) => this.places.set(places));
  }

  openMap(itinerary: Itinerary): void {
    void this.router.navigate(['/esplora'], {
      queryParams: { places: itinerary.placeIds.join(','), place: itinerary.placeIds[0] },
    });
  }

  ask(itinerary: Itinerary): void {
    this.chatbotUi.open(itinerary.placeIds[0]);
  }
}
