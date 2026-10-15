import '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { ChatbotKnowledgeBase } from '../models/chatbot.model';
import { Itinerary } from '../models/itinerary.model';
import { Place } from '../models/place.model';
import { LanguageService } from './language.service';
import { ItinerariesService } from './itineraries.service';
import { PlacesService } from './places.service';
import { StoriesService } from './stories.service';
import { ChatbotService } from './chatbot.service';

const places: Place[] = [
  {
    id: 'centro-storico',
    name: { it: 'Centro storico', en: 'Historic centre', fr: 'Centre historique' },
    category: 'heritage',
    shortDescription: { it: 'Borgo storico', en: 'Historic village', fr: 'Village historique' },
    description: {
      it: 'Un borgo da visitare a piedi.',
      en: 'A village to explore on foot.',
      fr: 'Un village à explorer à pied.',
    },
    latitude: 41.84,
    longitude: 14.56,
    image: '',
    alt: { it: '', en: '', fr: '' },
    tags: ['centro', 'borgo'],
    relatedPlaceIds: ['fontana-vecchia'],
    isVerifiedContent: true,
  },
  {
    id: 'fontana-vecchia',
    name: { it: 'Fontana Vecchia', en: 'Fontana Vecchia', fr: 'Fontana Vecchia' },
    category: 'memory',
    shortDescription: {
      it: 'Fontana storica in pietra.',
      en: 'Historic stone fountain.',
      fr: 'Fontaine historique en pierre.',
    },
    description: {
      it: 'Un luogo legato agli usi quotidiani dell’acqua.',
      en: 'A place connected to everyday water use.',
      fr: 'Un lieu lié aux usages quotidiens de l’eau.',
    },
    latitude: 41.84,
    longitude: 14.56,
    image: '',
    alt: { it: '', en: '', fr: '' },
    tags: ['fontana', 'fontana vecchia'],
    relatedPlaceIds: ['centro-storico'],
    isVerifiedContent: true,
  },
];

const itineraries: Itinerary[] = [
  {
    id: 'cuore-del-borgo',
    title: {
      it: 'Centro, piazza e memoria valdese',
      en: 'Centre, square and Waldensian memory',
      fr: 'Centre, place et mémoire vaudoise',
    },
    duration: { it: '30-45 minuti', en: '30-45 minutes', fr: '30-45 minutes' },
    difficulty: { it: 'Facile', en: 'Easy', fr: 'Facile' },
    shortDescription: { it: '', en: '', fr: '' },
    description: { it: '', en: '', fr: '' },
    placeIds: ['centro-storico', 'fontana-vecchia'],
    tags: ['centro'],
  },
];

describe('ChatbotService', () => {
  let service: ChatbotService;

  beforeEach(() => {
    const knowledge: ChatbotKnowledgeBase = { entries: [] };
    const injector = Injector.create({
      providers: [
        ChatbotService,
        {
          provide: HttpClient,
          useValue: { get: () => of(knowledge) },
        },
        {
          provide: LanguageService,
          useValue: {
            currentLanguage: () => 'it',
            localize: (value: { it: string } | string | undefined) =>
              typeof value === 'string' ? value : (value?.it ?? ''),
            t: (key: string) => key,
          },
        },
        { provide: PlacesService, useValue: { getPlaces: () => of(places) } },
        { provide: ItinerariesService, useValue: { getItineraries: () => of(itineraries) } },
        { provide: StoriesService, useValue: { getStories: () => of([]) } },
      ],
    });
    service = injector.get(ChatbotService);
  });

  it('recommends a route and links its stops for broad visit questions', async () => {
    const response = await service.ask('Cosa vedere in paese?');

    expect(response.text).toContain('Centro storico');
    expect(response.relatedPlaces?.map((place) => place.id)).toEqual([
      'centro-storico',
      'fontana-vecchia',
    ]);
  });

  it('answers place questions with map links to related places', async () => {
    const response = await service.ask('Dove si trova Fontana Vecchia?');

    expect(response.relatedPlaceId).toBe('fontana-vecchia');
    expect(response.relatedPlaces?.[0]).toEqual({
      id: 'centro-storico',
      name: 'Centro storico',
    });
  });

  it('does not invent practical details such as opening hours', async () => {
    const response = await service.ask('Quali sono gli orari della Fontana Vecchia?');

    expect(response.text).toContain('non riportano informazioni aggiornate');
    expect(response.relatedPlaces?.[0]?.id).toBe('fontana-vecchia');
  });
});
