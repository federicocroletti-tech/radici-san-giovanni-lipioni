import { LocalizedText } from './localized-text.model';

export interface StoryConsentEvidence {
  status: 'documented';
  recordRef: string;
  recordedAt: string;
  scope: string[];
}

export interface Story {
  id: string;
  title: LocalizedText;
  theme: string;
  excerpt: LocalizedText;
  content: LocalizedText;
  relatedPlaceIds: string[];
  isMock: boolean;
  consentRequiredNotice: LocalizedText;
  consent?: StoryConsentEvidence;
  sourceStatus?: 'verified' | 'to-verify' | 'research';
  editorialStatus?: 'draft' | 'review' | 'approved' | 'published';
}
