import { LocalizedText } from './localized-text.model';

export type ItineraryVerificationStatus = 'unverified' | 'field-verified';

export interface ItineraryFieldVerification {
  verifiedAt: string;
  source: string;
  distanceMeters: number;
  durationMinutes: number;
  difficulty: LocalizedText;
  accessibility: LocalizedText;
}

export interface Itinerary {
  id: string;
  title: LocalizedText;
  duration: LocalizedText;
  difficulty: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  placeIds: string[];
  tags: string[];
  verificationStatus: ItineraryVerificationStatus;
  fieldVerification?: ItineraryFieldVerification;
}

export function getItineraryProgress(
  placeIds: readonly string[],
  visitedPlaceIds: readonly string[],
): { completed: number; total: number } {
  const stops = new Set(placeIds);
  const visited = new Set(visitedPlaceIds);
  let completed = 0;

  for (const stop of stops) {
    if (visited.has(stop)) {
      completed++;
    }
  }

  return { completed, total: stops.size };
}
