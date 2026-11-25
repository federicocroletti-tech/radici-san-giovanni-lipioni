import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePlaceCoordinates } from './validate-place-coordinates.mjs';

test('accepts unlocated records and valid coordinate pairs', () => {
  const result = validatePlaceCoordinates([
    { id: 'unlocated-place' },
    {
      id: 'located-place',
      latitude: 41.84,
      longitude: 14.56,
      coordinateStatus: 'osm-unverified',
      coordinateSource: 'OpenStreetMap',
    },
    {
      id: 'surveyed-place',
      latitude: 41.85,
      longitude: 14.57,
      coordinateStatus: 'field-verified',
      coordinateSource: 'On-site survey',
      coordinateVerifiedAt: '2026-11-25',
    },
  ]);

  assert.deepEqual(result.errors, []);
  assert.equal(result.locatedCount, 2);
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

test('requires source and verification metadata for located places', () => {
  const result = validatePlaceCoordinates([
    { id: 'missing-source', latitude: 41.84, longitude: 14.56 },
    {
      id: 'invalid-survey-date',
      latitude: 41.85,
      longitude: 14.57,
      coordinateStatus: 'field-verified',
      coordinateSource: 'On-site survey',
      coordinateVerifiedAt: '2026-02-31',
    },
    {
      id: 'unverified-with-date',
      latitude: 41.86,
      longitude: 14.58,
      coordinateStatus: 'osm-unverified',
      coordinateSource: 'OpenStreetMap',
      coordinateVerifiedAt: '2026-11-25',
    },
  ]);

  assert.deepEqual(result.errors, [
    'missing-source: coordinateStatus must be osm-unverified or field-verified.',
    'missing-source: coordinateSource must be a non-empty string.',
    'invalid-survey-date: field-verified coordinates require a valid coordinateVerifiedAt date.',
    'unverified-with-date: osm-unverified coordinates must not have a verification date.',
  ]);
});

test('rejects coordinate metadata when a place has no coordinates', () => {
  const result = validatePlaceCoordinates([
    { id: 'unlocated-place', coordinateStatus: 'osm-unverified' },
  ]);

  assert.deepEqual(result.errors, [
    'unlocated-place: coordinate metadata requires coordinates.',
  ]);
});

test('rejects the common 0,0 placeholder coordinate', () => {
  const result = validatePlaceCoordinates([{ id: 'placeholder-place', latitude: 0, longitude: 0 }]);

  assert.deepEqual(result.errors, [
    'placeholder-place: coordinates must not use the 0,0 placeholder.',
  ]);
  assert.equal(result.locatedCount, 0);
});

test('rejects duplicate ids and coordinate pairs', () => {
  const result = validatePlaceCoordinates([
    {
      id: 'first-place',
      latitude: 41.84,
      longitude: 14.56,
      coordinateStatus: 'osm-unverified',
      coordinateSource: 'OpenStreetMap',
    },
    {
      id: 'first-place',
      latitude: 41.85,
      longitude: 14.57,
      coordinateStatus: 'osm-unverified',
      coordinateSource: 'OpenStreetMap',
    },
    {
      id: 'same-coordinate',
      latitude: 41.84,
      longitude: 14.56,
      coordinateStatus: 'osm-unverified',
      coordinateSource: 'OpenStreetMap',
    },
  ]);

  assert.deepEqual(result.errors, [
    'first-place: duplicate place id.',
    'same-coordinate: coordinates duplicate first-place.',
  ]);
});
