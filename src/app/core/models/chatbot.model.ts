import { LocalizedText } from './localized-text.model';

export interface ChatbotCitation {
  id: string;
  title: string;
  creator: string;
  citation: string;
  url: string | null;
  consultedAt: string;
  claims: string[];
}

export interface ChatbotKnowledgeEntry {
  id: string;
  intent: string;
  keywords: string[];
  answer: LocalizedText;
  relatedPlaceId?: string;
  relatedItineraryId?: string;
  source: string;
}

export interface ChatbotKnowledgeBase {
  entries: ChatbotKnowledgeEntry[];
}

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  relatedPlaceId?: string;
  relatedPlaces?: { id: string; name: string }[];
  citations?: ChatbotCitation[];
  createdAt: string;
}

export interface ChatbotResponse {
  text: string;
  relatedPlaceId?: string;
  relatedPlaces?: { id: string; name: string }[];
  citations?: ChatbotCitation[];
}
