import { LocalizedText } from './localized-text.model';

export type PlaceSourceStatus = 'verified' | 'to-verify' | 'research';
export type EditorialStatus = 'draft' | 'review' | 'approved' | 'published';

export interface Place {
  id: string;
  name: LocalizedText;
  category: string;
  sourceStatus?: PlaceSourceStatus;
  editorialStatus?: EditorialStatus;
  shortDescription: LocalizedText;
  description: LocalizedText;
  historicalInterest?: LocalizedText;
  architecturalInterest?: LocalizedText;
  landscapeInterest?: LocalizedText;
  curiosity?: LocalizedText;
  sourceNotes?: LocalizedText;
  latitude?: number;
  longitude?: number;
  image: string;
  alt: LocalizedText;
  imageCredit?: LocalizedText;
  imageSourceUrl?: string;
  imageLicenseUrl?: string;
  imageVerifiedAt?: string;
  detailsPath?: string;
  tags: string[];
  relatedPlaceIds: string[];
  isVerifiedContent: boolean;
}

export interface LocatedPlace extends Place {
  latitude: number;
  longitude: number;
}

export function hasPlaceCoordinates(
  place: Pick<Place, 'latitude' | 'longitude'>,
): place is LocatedPlace {
  return Number.isFinite(place.latitude) && Number.isFinite(place.longitude);
}

export interface PlaceCategory {
  id: string;
  label: LocalizedText;
  icon: string;
}
