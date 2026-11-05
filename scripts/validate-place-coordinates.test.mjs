import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePlaceCoordinates } from './validate-place-coordinates.mjs';

test('accepts unlocated records and valid coordinate pairs', () => {
  const result = validatePlaceCoordinates([
    { id: 'unlocated-place' },
    { id: 'located-place', latitude: 41.84, longitude: 14.56 },
  ]);

  assert.deepEqual(result.errors, []);
  assert.equal(result.locatedCount, 1);
});

test('rejects incomplete and out-of-range coordinates', () => {
  const result = validatePlaceCoordinates([
    { id: 'partial-place', latitude: 41.84 },
    { id: 'out-of-range-place', latitude: 91, longitude: 14.56 },
  ]);

  assert.deepEqual(result.errors, [
    'partial-place: latitude and longitude must be provided together.',
    'out-of-range-place: coordinates must be finite WGS84 latitude/longitude values.',
  ]);
});

test('rejects duplicate ids and coordinate pairs', () => {
  const result = validatePlaceCoordinates([
    { id: 'first-place', latitude: 41.84, longitude: 14.56 },
    { id: 'first-place', latitude: 41.85, longitude: 14.57 },
    { id: 'same-coordinate', latitude: 41.84, longitude: 14.56 },
  ]);

  assert.deepEqual(result.errors, [
    'first-place: duplicate place id.',
    'same-coordinate: coordinates duplicate first-place.',
  ]);
});
