import { LocalizedText } from './localized-text.model';

export interface Itinerary {
  id: string;
  title: LocalizedText;
  duration: LocalizedText;
  difficulty: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  placeIds: string[];
  tags: string[];
}
