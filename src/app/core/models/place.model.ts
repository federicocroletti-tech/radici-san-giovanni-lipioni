import { LocalizedText } from './localized-text.model';

export interface Place {
  id: string;
  name: LocalizedText;
  category: string;
  shortDescription: LocalizedText;
  description: LocalizedText;
  latitude: number;
  longitude: number;
  image: string;
  alt: LocalizedText;
  detailsPath?: string;
  tags: string[];
  relatedPlaceIds: string[];
  isVerifiedContent: boolean;
}

export interface PlaceCategory {
  id: string;
  label: LocalizedText;
  icon: string;
}
