import { LocalizedText } from './localized-text.model';

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
  createdAt: string;
}

export interface ChatbotResponse {
  text: string;
  relatedPlaceId?: string;
}
