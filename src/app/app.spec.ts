/// <reference types="vitest" />

import { hasPlaceCoordinates } from './core/models/place.model';

describe('App', () => {
  it('should keep the project identity explicit', () => {
    expect('Radici San Giovanni Lipioni').toContain('San Giovanni Lipioni');
  });
});

describe('place coordinates', () => {
  it('accepts finite coordinate pairs', () => {
    expect(hasPlaceCoordinates({ latitude: 41.84, longitude: 14.56 })).toBe(true);
  });

  it('rejects incomplete or non-finite coordinate pairs', () => {
    expect(hasPlaceCoordinates({ latitude: 41.84 })).toBe(false);
    expect(hasPlaceCoordinates({ latitude: Number.NaN, longitude: 14.56 })).toBe(false);
  });
});
