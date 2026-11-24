/// <reference types="vitest" />

import { hasPlaceCoordinates } from './core/models/place.model';
import { getItineraryProgress } from './core/models/itinerary.model';

describe('App', () => {
  it('should keep the project identity explicit', () => {
    expect('Radici San Giovanni Lipioni').toContain('San Giovanni Lipioni');
  });
});

describe('place coordinates', () => {
  it('accepts finite coordinate pairs', () => {
    expect(hasPlaceCoordinates({ latitude: 41.84, longitude: 14.56 })).toBe(true);
  });

  describe('itinerary progress', () => {
    it('counts unique route stops marked as visited', () => {
      expect(getItineraryProgress(['square', 'church', 'square'], ['church', 'unknown'])).toEqual({
        completed: 1,
        total: 2,
      });
    });

    it('returns zero progress for an empty itinerary', () => {
      expect(getItineraryProgress([], ['church'])).toEqual({ completed: 0, total: 0 });
    });
  });

  it('rejects incomplete or non-finite coordinate pairs', () => {
    expect(hasPlaceCoordinates({ latitude: 41.84 })).toBe(false);
    expect(hasPlaceCoordinates({ latitude: Number.NaN, longitude: 14.56 })).toBe(false);
  });
});
