import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { validateItineraryData } from './validate-itinerary-data.mjs';

const text = { it: 'Testo', en: 'Text', fr: 'Texte' };
const places = [
  {
    id: 'place-one',
    latitude: 41.84,
    longitude: 14.56,
    coordinateStatus: 'field-verified',
  },
  { id: 'place-two', latitude: 41.85, longitude: 14.57, coordinateStatus: 'osm-unverified' },
];

function itinerary(overrides = {}) {
  return {
    id: 'route-one',
    title: text,
    duration: text,
    difficulty: text,
    shortDescription: text,
    description: text,
    placeIds: ['place-one'],
    tags: ['borgo'],
    verificationStatus: 'unverified',
    ...overrides,
  };
}

function fieldVerification(overrides = {}) {
  return {
    verifiedAt: '2026-11-25',
    source: 'Rilievo sul posto',
    distanceMeters: 850,
    durationMinutes: 35,
    difficulty: text,
    accessibility: text,
    ...overrides,
  };
}

test('accepts an unverified itinerary with valid stops', () => {
  assert.deepEqual(validateItineraryData([itinerary()], places).errors, []);
});

test('accepts a field-verified itinerary with complete evidence and verified coordinates', () => {
  assert.deepEqual(
    validateItineraryData(
      [
        itinerary({
          verificationStatus: 'field-verified',
          fieldVerification: fieldVerification(),
        }),
      ],
      places,
    ).errors,
    [],
  );
});

test('rejects unknown and duplicate itinerary stops', () => {
  const { errors } = validateItineraryData(
    [itinerary({ placeIds: ['place-one', 'missing-place', 'place-one'] })],
    places,
  );
  assert.ok(errors.includes('route-one: place missing-place does not exist.'));
  assert.ok(errors.includes('route-one: duplicate stop place-one.'));
});

test('rejects field verification without complete measurements and accessibility notes', () => {
  const { errors } = validateItineraryData(
    [
      itinerary({
        verificationStatus: 'field-verified',
        fieldVerification: fieldVerification({
          verifiedAt: '2026-02-31',
          source: '',
          distanceMeters: 0,
          durationMinutes: -1,
          accessibility: { it: '', en: '', fr: '' },
        }),
      }),
    ],
    places,
  );
  assert.ok(errors.some((error) => error.includes('verifiedAt must be a valid')));
  assert.ok(errors.some((error) => error.includes('source must be a non-empty string')));
  assert.ok(errors.some((error) => error.includes('distanceMeters must be a positive number')));
  assert.ok(errors.some((error) => error.includes('durationMinutes must be a positive number')));
  assert.ok(errors.some((error) => error.includes('fieldVerification accessibility: it text')));
});

test('prevents field verification while any route stop lacks field-verified coordinates', () => {
  const { errors } = validateItineraryData(
    [
      itinerary({
        placeIds: ['place-one', 'place-two'],
        verificationStatus: 'field-verified',
        fieldVerification: fieldVerification(),
      }),
    ],
    places,
  );

  assert.deepEqual(errors, [
    'route-one: field-verified itinerary stop place-two must have field-verified coordinates.',
  ]);
});

test('committed itineraries are valid against committed places', () => {
  const dataDirectory = resolve(import.meta.dirname, '../src/assets/data');
  const read = (file) => JSON.parse(readFileSync(resolve(dataDirectory, file), 'utf8'));
  assert.deepEqual(validateItineraryData(read('itineraries.json'), read('places.json')).errors, []);
});
