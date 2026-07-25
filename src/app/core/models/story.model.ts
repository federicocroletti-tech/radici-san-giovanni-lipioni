import { LocalizedText } from './localized-text.model';

export interface Story {
  id: string;
  title: LocalizedText;
  theme: string;
  excerpt: LocalizedText;
  content: LocalizedText;
  relatedPlaceIds: string[];
  isMock: boolean;
  consentRequiredNotice: LocalizedText;
}
