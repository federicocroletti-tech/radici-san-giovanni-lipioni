import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, shareReplay } from 'rxjs';
import { ChatbotKnowledgeBase, ChatbotResponse } from '../models/chatbot.model';
import { Itinerary } from '../models/itinerary.model';
import { Place } from '../models/place.model';
import { Story } from '../models/story.model';
import { LanguageService } from './language.service';
import { ItinerariesService } from './itineraries.service';
import { PlacesService } from './places.service';
import { StoriesService } from './stories.service';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly language = inject(LanguageService);
  private readonly placesService = inject(PlacesService);
  private readonly itinerariesService = inject(ItinerariesService);
  private readonly storiesService = inject(StoriesService);
  private readonly knowledge$ = this.http
    .get<ChatbotKnowledgeBase>('assets/data/chatbot-knowledge.json')
    .pipe(shareReplay(1));

  async ask(question: string, contextPlaceId?: string | null): Promise<ChatbotResponse> {
    const normalizedQuestion = this.normalize(question);
    const [knowledge, places, itineraries, stories] = await Promise.all([
      firstValueFrom(this.knowledge$),
      firstValueFrom(this.placesService.getPlaces()),
      firstValueFrom(this.itinerariesService.getItineraries()),
      firstValueFrom(this.storiesService.getStories()),
    ]);

    const entry = knowledge.entries.find((item) =>
      item.keywords.some((keyword) => normalizedQuestion.includes(this.normalize(keyword))),
    );

    if (entry) {
      return {
        text: this.language.localize(entry.answer),
        relatedPlaceId: entry.relatedPlaceId,
      };
    }

    const contextualPlace = contextPlaceId
      ? places.find((place) => place.id === contextPlaceId)
      : undefined;
    if (contextualPlace && this.isContextualQuestion(normalizedQuestion)) {
      return {
        text: this.language.localize(contextualPlace.description),
        relatedPlaceId: contextualPlace.id,
      };
    }

    const place = this.findPlace(normalizedQuestion, places);
    if (place) {
      return {
        text: this.language.localize(place.description),
        relatedPlaceId: place.id,
      };
    }

    const itinerary = this.findItinerary(normalizedQuestion, itineraries);
    if (itinerary) {
      return { text: this.language.localize(itinerary.description) };
    }

    const story = this.findStory(normalizedQuestion, stories);
    if (story) {
      return { text: this.language.localize(story.excerpt) };
    }

    return { text: this.language.t('chatbot.fallback') };
  }

  private findPlace(question: string, places: Place[]): Place | undefined {
    return places.find((place) => {
      const haystack = [this.language.localize(place.name), place.category, ...place.tags].map(
        (value) => this.normalize(value),
      );

      return haystack.some((value) => value && question.includes(value));
    });
  }

  private findItinerary(question: string, itineraries: Itinerary[]): Itinerary | undefined {
    return itineraries.find((itinerary) => {
      const haystack = [this.language.localize(itinerary.title), ...itinerary.tags].map((value) =>
        this.normalize(value),
      );
      return haystack.some((value) => value && question.includes(value));
    });
  }

  private findStory(question: string, stories: Story[]): Story | undefined {
    return stories.find((story) => {
      const haystack = [this.language.localize(story.title), story.theme].map((value) =>
        this.normalize(value),
      );
      return haystack.some((value) => value && question.includes(value));
    });
  }

  private isContextualQuestion(question: string): boolean {
    return [
      'questo luogo',
      'this place',
      'dettaglio',
      'details',
      'informazioni',
      'information',
    ].some((keyword) => question.includes(keyword));
  }

  private normalize(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
