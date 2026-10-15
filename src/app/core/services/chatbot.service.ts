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
      return await this.buildPlaceResponse(contextualPlace, places);
    }

    if (this.isPracticalInformationQuestion(normalizedQuestion)) {
      const mentionedPlace = this.bestMatch(
        places,
        (place) => [this.language.localize(place.name), ...place.tags],
        normalizedQuestion,
      );
      return this.buildPracticalInformationResponse(
        places,
        mentionedPlace && mentionedPlace.score >= 2 ? mentionedPlace.item.id : undefined,
      );
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
      return await this.buildPlaceResponse(placeMatch.item, places);
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
      return this.buildKnowledgeResponse(knowledgeMatch.item, places);
    }

    if (this.isItineraryRecommendationQuestion(normalizedQuestion)) {
      return this.buildItineraryOverview(itineraries, places);
    }

    if (this.isGeneralVisitQuestion(normalizedQuestion)) {
      return this.buildVisitRecommendation(itineraries, places);
    }

    return { text: this.language.t('chatbot.fallback') };
  }

  private async buildPlaceResponse(place: Place, places: Place[]): Promise<ChatbotResponse> {
    const name = this.language.localize(place.name);
    const description =
      (await this.getPlaceSheetDescription(place)) || this.language.localize(place.description);
    const relatedNames = place.relatedPlaceIds
      .map((placeId) => places.find((candidate) => candidate.id === placeId))
      .filter((candidate): candidate is Place => Boolean(candidate))
      .map((candidate) => this.language.localize(candidate.name));

    const text = this.isItalian()
      ? [
          `Ti porto su ${name}. ${description}`,
          relatedNames.length
            ? `Per una visita piu completa lo collegherei a ${relatedNames.slice(0, 2).join(' e ')}.`
            : '',
          'Posso aprirlo sulla mappa o aiutarti a inserirlo in un itinerario.',
        ]
          .filter(Boolean)
          .join(' ')
      : this.isFrench()
        ? [
            `Je te propose ${name}. ${description}`,
            relatedNames.length
              ? `Pour une visite plus complète, je le relierais à ${relatedNames.slice(0, 2).join(' et ')}.`
              : '',
            'Je peux l’ouvrir sur la carte ou t’aider à l’intégrer dans un itinéraire.',
          ]
            .filter(Boolean)
            .join(' ')
        : [
            `Let's look at ${name}. ${description}`,
            relatedNames.length
              ? `For a fuller visit I would connect it with ${relatedNames.slice(0, 2).join(' and ')}.`
              : '',
            'I can open it on the map or help you place it inside an itinerary.',
          ]
            .filter(Boolean)
            .join(' ');

    return {
      text,
      relatedPlaceId: place.id,
      relatedPlaces: this.getRelatedPlaces(place.relatedPlaceIds, places),
    };
  }

  private async getPlaceSheetDescription(place: Place): Promise<string> {
    if (!this.isItalian() || !place.detailsPath) {
      return '';
    }

    try {
      const markdown = await firstValueFrom(
        this.http.get(place.detailsPath, { responseType: 'text' }),
      );
      return this.extractMarkdownSection(markdown, 'Descrizione');
    } catch {
      return '';
    }
  }

  private extractMarkdownSection(markdown: string, heading: string): string {
    const pattern = new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'm');
    const match = markdown.match(pattern);
    return match?.[1]?.replace(/\s+/g, ' ').trim() ?? '';
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
      : this.isFrench()
        ? `${title}: ${description} Les étapes sont ${stops.join(', ')}. Je te conseille de l’utiliser comme trame, puis de vérifier les temps et l’accessibilité sur place.`
        : `${title}: ${description} The stops are ${stops.join(', ')}. I suggest using it as a guide, then checking timing and accessibility on site.`;

    return {
      text,
      relatedPlaceId: itinerary.placeIds[0],
      relatedPlaces: this.getRelatedPlaces(itinerary.placeIds, places),
    };
  }

  private buildStoryResponse(story: Story, places: Place[]): ChatbotResponse {
    const title = this.language.localize(story.title);
    const excerpt = this.language.localize(story.excerpt);
    const relatedPlace = places.find((place) => story.relatedPlaceIds.includes(place.id));
    const notice = this.language.localize(story.consentRequiredNotice);
    const text = this.isItalian()
      ? `${title}: ${excerpt} Nota importante: ${notice} Posso mostrarti il luogo collegato sulla mappa.`
      : this.isFrench()
        ? `${title}: ${excerpt} Note importante : ${notice} Je peux te montrer le lieu associé sur la carte.`
        : `${title}: ${excerpt} Important note: ${notice} I can show you the linked place on the map.`;

    return {
      text,
      relatedPlaceId: relatedPlace?.id,
      relatedPlaces: relatedPlace ? this.getRelatedPlaces([relatedPlace.id], places) : [],
    };
  }

  private buildKnowledgeResponse(entry: ChatbotKnowledgeEntry, places: Place[]): ChatbotResponse {
    const answer = this.language.localize(entry.answer);
    const text = this.isItalian()
      ? `${answer} Se vuoi, posso anche indicarti un luogo sulla mappa o suggerirti un itinerario breve.`
      : this.isFrench()
        ? `${answer} Si tu veux, je peux aussi t’indiquer un lieu sur la carte ou te proposer un court itinéraire.`
        : `${answer} If you want, I can also point you to a place on the map or suggest a short itinerary.`;

    return {
      text,
      relatedPlaceId: entry.relatedPlaceId,
      relatedPlaces: entry.relatedPlaceId
        ? this.getRelatedPlaces([entry.relatedPlaceId], places)
        : [],
    };
  }

  private buildItineraryOverview(itineraries: Itinerary[], places: Place[]): ChatbotResponse {
    const recommended = itineraries.find((itinerary) => itinerary.id === 'cuore-del-borgo');
    if (!recommended) {
      return { text: this.language.t('chatbot.fallback') };
    }

    const alternatives = itineraries.filter((itinerary) => itinerary.id !== recommended.id);
    const recommendedTitle = this.language.localize(recommended.title);
    const recommendedDuration = this.language.localize(recommended.duration);
    const alternativeText = alternatives
      .map(
        (itinerary) =>
          `${this.language.localize(itinerary.title)} (${this.language.localize(itinerary.duration)})`,
      )
      .join('; ');
    const text = this.isItalian()
      ? `Per una prima visita ti consiglio ${recommendedTitle} (${recommendedDuration}): attraversa il centro, la piazza, la Mostra Valdese e la chiesa. In alternativa: ${alternativeText}. Tempi, pendenze e accessibilita vanno verificati sul posto.`
      : this.isFrench()
        ? `Pour une première visite, je conseille ${recommendedTitle} (${recommendedDuration}) : il passe par le centre, la place, l’exposition vaudoise et l’église. Autres options : ${alternativeText}. Les durées, pentes et conditions d’accessibilité sont à vérifier sur place.`
        : `For a first visit, I recommend ${recommendedTitle} (${recommendedDuration}): it covers the centre, square, Waldensian exhibition and church. Alternatives: ${alternativeText}. Check timing, slopes and accessibility on site.`;

    return {
      text,
      relatedPlaces: this.getRelatedPlaces(recommended.placeIds, places),
    };
  }

  private buildVisitRecommendation(itineraries: Itinerary[], places: Place[]): ChatbotResponse {
    const itinerary = itineraries.find((candidate) => candidate.id === 'cuore-del-borgo');
    if (!itinerary) {
      return this.buildItineraryOverview(itineraries, places);
    }

    const stops = this.getRelatedPlaces(itinerary.placeIds, places);
    const stopNames = stops.map((place) => place.name);
    const text = this.isItalian()
      ? `Per iniziare, farei un giro nel centro storico: ${stopNames.join(', ')}. Il percorso “${this.language.localize(itinerary.title)}” richiede circa ${this.language.localize(itinerary.duration)} secondo la scheda; considera il tempo indicativo e verifica sul posto pendenze e accessibilita.`
      : this.isFrench()
        ? `Pour commencer, je visiterais le centre historique : ${stopNames.join(', ')}. Le parcours « ${this.language.localize(itinerary.title)} » est estimé à ${this.language.localize(itinerary.duration)} dans la fiche ; vérifie sur place le temps, les pentes et l’accessibilité.`
        : `To get started, explore the historic centre: ${stopNames.join(', ')}. The “${this.language.localize(itinerary.title)}” route is estimated at ${this.language.localize(itinerary.duration)} in the guide; check actual timing, slopes and accessibility on site.`;

    return { text, relatedPlaces: stops };
  }

  private buildPracticalInformationResponse(
    places: Place[],
    mentionedPlaceId?: string,
  ): ChatbotResponse {
    const text = this.isItalian()
      ? 'Le schede disponibili non riportano informazioni aggiornate su orari, parcheggi, trasporti, ristoranti o servizi. Per evitare indicazioni inesatte, verifica queste informazioni con il Comune o con le strutture locali prima della visita. Posso invece aiutarti a esplorare i luoghi e i percorsi presenti nella guida.'
      : this.isFrench()
        ? 'Les fiches disponibles ne donnent pas d’informations à jour sur les horaires, le stationnement, les transports, les restaurants ou les services. Pour éviter toute erreur, vérifie ces informations auprès de la commune ou des établissements locaux avant ta visite. Je peux toutefois te présenter les lieux et parcours de ce guide.'
        : 'The available listings do not include current opening hours, parking, transport, restaurants or services. To avoid inaccurate advice, check with the municipality or local venues before your visit. I can still help you explore the places and routes in this guide.';

    return {
      text,
      relatedPlaces: this.getRelatedPlaces([mentionedPlaceId ?? 'centro-storico'], places),
    };
  }

  private getRelatedPlaces(
    placeIds: string[],
    places: Place[],
  ): Array<{ id: string; name: string }> {
    return placeIds
      .map((placeId) => places.find((place) => place.id === placeId))
      .filter((place): place is Place => Boolean(place))
      .map((place) => ({ id: place.id, name: this.language.localize(place.name) }));
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
      'quoi',
      'quel',
      'quelle',
      'quels',
      'quelles',
      'comment',
      'dans',
      'des',
      'les',
      'une',
      'sur',
      'avec',
      'parle',
      'moi',
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

  private isItineraryRecommendationQuestion(question: string): boolean {
    return [
      'itinerario',
      'itinerari',
      'percorso',
      'percorsi',
      'route',
      'routes',
      'itinerary',
      'itineraries',
      'quel itineraire',
      'itineraire',
      'consigli',
      'consigliami',
      'recommend',
      'suggest',
      'conseille',
    ].some((keyword) => question.includes(keyword));
  }

  private isGeneralVisitQuestion(question: string): boolean {
    return [
      'cosa vedere',
      'cosa visitare',
      'da vedere',
      'luoghi da vedere',
      'cosa fare',
      'what to see',
      'what to visit',
      'must see',
      'quoi voir',
      'que visiter',
      'a visiter',
    ].some((keyword) => question.includes(keyword));
  }

  private isPracticalInformationQuestion(question: string): boolean {
    return [
      'orari',
      'aperto',
      'apertura',
      'parcheggio',
      'parcheggiare',
      'trasporti',
      'autobus',
      'ristorante',
      'ristoranti',
      'mangiare',
      'dormire',
      'alloggio',
      'prezzo',
      'prezzi',
      'costo',
      'meteo',
      'eventi',
      'accessibilita',
      'disabili',
      'accommodation',
      'lodging',
      'weather',
      'events',
      'ticket',
      'price',
      'cost',
      'parking',
      'opening hours',
      'opening time',
      'public transport',
      'restaurant',
      'accessible',
      'accessibility',
      'horaires',
      'stationnement',
      'transport',
      'restaurant',
      'hebergement',
      'meteo',
      'evenement',
      'prix',
      'accessibilite',
    ].some((keyword) => question.includes(keyword));
  }

  private isItalian(): boolean {
    return this.language.currentLanguage() === 'it';
  }

  private isFrench(): boolean {
    return this.language.currentLanguage() === 'fr';
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
