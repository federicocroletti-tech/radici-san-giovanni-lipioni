import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, shareReplay } from 'rxjs';
import {
  ChatbotKnowledgeBase,
  ChatbotKnowledgeEntry,
  ChatbotResponse,
} from '../models/chatbot.model';
import { Itinerary } from '../models/itinerary.model';
import { Place } from '../models/place.model';
import { Story } from '../models/story.model';
import { LanguageService } from './language.service';
import { ItinerariesService } from './itineraries.service';
import { PlacesService } from './places.service';
import { StoriesService } from './stories.service';

interface ScoredMatch<T> {
  item: T;
  score: number;
}

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

    const contextualPlace = contextPlaceId
      ? places.find((place) => place.id === contextPlaceId)
      : undefined;

    if (
      contextualPlace &&
      (this.isContextualQuestion(normalizedQuestion) || normalizedQuestion.length < 4)
    ) {
      return this.buildPlaceResponse(contextualPlace, places);
    }

    const placeMatch = this.bestMatch(
      places,
      (place) => [
        this.language.localize(place.name),
        this.language.localize(place.shortDescription),
        place.category,
        ...place.tags,
      ],
      normalizedQuestion,
    );

    if (placeMatch?.score && placeMatch.score >= 4) {
      return this.buildPlaceResponse(placeMatch.item, places);
    }

    const itineraryMatch = this.bestMatch(
      itineraries,
      (itinerary) => [
        this.language.localize(itinerary.title),
        this.language.localize(itinerary.shortDescription),
        this.language.localize(itinerary.description),
        ...itinerary.tags,
      ],
      normalizedQuestion,
    );

    if (itineraryMatch?.score && itineraryMatch.score >= 3) {
      return this.buildItineraryResponse(itineraryMatch.item, places);
    }

    const storyMatch = this.bestMatch(
      stories,
      (story) => [
        this.language.localize(story.title),
        this.language.localize(story.excerpt),
        story.theme,
      ],
      normalizedQuestion,
    );

    if (storyMatch?.score && storyMatch.score >= 3) {
      return this.buildStoryResponse(storyMatch.item, places);
    }

    const knowledgeMatch = this.bestMatch(
      knowledge.entries,
      (entry) => [entry.intent, ...entry.keywords, this.language.localize(entry.answer)],
      normalizedQuestion,
    );

    if (knowledgeMatch?.score && knowledgeMatch.score >= 2) {
      return this.buildKnowledgeResponse(knowledgeMatch.item);
    }

    return { text: this.language.t('chatbot.fallback') };
  }

  private buildPlaceResponse(place: Place, places: Place[]): ChatbotResponse {
    const name = this.language.localize(place.name);
    const description = this.language.localize(place.description);
    const sources = place.sourceNotes.slice(0, 2).join(' ');
    const relatedNames = place.relatedPlaceIds
      .map((placeId) => places.find((candidate) => candidate.id === placeId))
      .filter((candidate): candidate is Place => Boolean(candidate))
      .map((candidate) => this.language.localize(candidate.name));

    const text = this.isItalian()
      ? [
          `Ti porto su ${name}. ${description}`,
          sources ? `Fonti principali: ${sources}` : '',
          relatedNames.length
            ? `Per una visita piu completa lo collegherei a ${relatedNames.slice(0, 2).join(' e ')}.`
            : '',
          'Posso aprirlo sulla mappa o aiutarti a inserirlo in un itinerario.',
        ]
          .filter(Boolean)
          .join(' ')
      : [
          `Let's look at ${name}. ${description}`,
          sources ? `Main sources: ${sources}` : '',
          relatedNames.length
            ? `For a fuller visit I would connect it with ${relatedNames.slice(0, 2).join(' and ')}.`
            : '',
          'I can open it on the map or help you place it inside an itinerary.',
        ]
          .filter(Boolean)
          .join(' ');

    return { text, relatedPlaceId: place.id };
  }

  private buildItineraryResponse(itinerary: Itinerary, places: Place[]): ChatbotResponse {
    const title = this.language.localize(itinerary.title);
    const description = this.language.localize(itinerary.description);
    const stops = itinerary.placeIds
      .map((placeId) => places.find((place) => place.id === placeId))
      .filter((place): place is Place => Boolean(place))
      .map((place) => this.language.localize(place.name));

    const text = this.isItalian()
      ? `${title}: ${description} Le tappe sono ${stops.join(', ')}. Ti suggerisco di usarlo come traccia, poi verificare tempi e accessibilita sul posto.`
      : `${title}: ${description} The stops are ${stops.join(', ')}. I suggest using it as a guide, then checking timing and accessibility on site.`;

    return { text, relatedPlaceId: itinerary.placeIds[0] };
  }

  private buildStoryResponse(story: Story, places: Place[]): ChatbotResponse {
    const title = this.language.localize(story.title);
    const excerpt = this.language.localize(story.excerpt);
    const relatedPlace = places.find((place) => story.relatedPlaceIds.includes(place.id));
    const notice = this.language.localize(story.consentRequiredNotice);
    const text = this.isItalian()
      ? `${title}: ${excerpt} Nota importante: ${notice} Posso mostrarti il luogo collegato sulla mappa.`
      : `${title}: ${excerpt} Important note: ${notice} I can show you the linked place on the map.`;

    return { text, relatedPlaceId: relatedPlace?.id };
  }

  private buildKnowledgeResponse(entry: ChatbotKnowledgeEntry): ChatbotResponse {
    const answer = this.language.localize(entry.answer);
    const text = this.isItalian()
      ? `${answer} Se vuoi, posso anche indicarti un luogo sulla mappa o suggerirti un itinerario breve.`
      : `${answer} If you want, I can also point you to a place on the map or suggest a short itinerary.`;

    return { text, relatedPlaceId: entry.relatedPlaceId };
  }

  private bestMatch<T>(
    items: T[],
    candidates: (item: T) => string[],
    normalizedQuestion: string,
  ): ScoredMatch<T> | null {
    return (
      items
        .map((item) => ({
          item,
          score: this.scoreCandidates(normalizedQuestion, candidates(item)),
        }))
        .filter((match) => match.score > 0)
        .sort((a, b) => b.score - a.score)[0] ?? null
    );
  }

  private scoreCandidates(normalizedQuestion: string, candidates: string[]): number {
    const questionTokens = this.significantTokens(normalizedQuestion);

    return candidates.reduce((score, candidate) => {
      const normalizedCandidate = this.normalize(candidate);
      if (!normalizedCandidate) {
        return score;
      }

      const phraseScore = normalizedQuestion.includes(normalizedCandidate) ? 8 : 0;
      const candidateTokens = this.significantTokens(normalizedCandidate);
      const tokenScore = candidateTokens.filter(
        (token) => questionTokens.includes(token) || normalizedQuestion.includes(token),
      ).length;
      return score + phraseScore + tokenScore;
    }, 0);
  }

  private significantTokens(value: string): string[] {
    const stopwords = new Set([
      'che',
      'cosa',
      'come',
      'dove',
      'della',
      'delle',
      'degli',
      'del',
      'dei',
      'di',
      'la',
      'lo',
      'il',
      'gli',
      'le',
      'via',
      'parlami',
      'tell',
      'about',
      'the',
      'what',
      'where',
      'how',
      'and',
      'with',
    ]);

    return value.split(/\s+/).filter((token) => token.length > 2 && !stopwords.has(token));
  }

  private isContextualQuestion(question: string): boolean {
    return [
      'questo luogo',
      'this place',
      'dettaglio',
      'details',
      'informazioni',
      'information',
      'dimmi di piu',
      'tell me more',
    ].some((keyword) => question.includes(keyword));
  }

  private isItalian(): boolean {
    return this.language.currentLanguage() === 'it';
  }

  private normalize(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
