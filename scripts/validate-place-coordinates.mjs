import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function validatePlaceCoordinates(places) {
  if (!Array.isArray(places)) {
    return { errors: ['Place data must be a JSON array.'], locatedCount: 0 };
  }

  const errors = [];
  const seenIds = new Set();
  const coordinatesByPlace = new Map();
  const coordinateStatuses = new Set(['osm-unverified', 'field-verified']);
  let locatedCount = 0;

  for (const [index, place] of places.entries()) {
    const label = typeof place?.id === 'string' && place.id ? place.id : `record ${index + 1}`;

    if (!place || typeof place !== 'object' || Array.isArray(place)) {
      errors.push(`${label}: record must be an object.`);
      continue;
    }

    if (typeof place.id !== 'string' || !place.id.trim()) {
      errors.push(`${label}: id must be a non-empty string.`);
    } else if (seenIds.has(place.id)) {
      errors.push(`${place.id}: duplicate place id.`);
    } else {
      seenIds.add(place.id);
    }

    const hasLatitude = Object.hasOwn(place, 'latitude');
    const hasLongitude = Object.hasOwn(place, 'longitude');

    if (hasLatitude !== hasLongitude) {
      errors.push(`${label}: latitude and longitude must be provided together.`);
      continue;
    }

    if (!hasLatitude) {
      if (
        Object.hasOwn(place, 'coordinateStatus') ||
        Object.hasOwn(place, 'coordinateSource') ||
        Object.hasOwn(place, 'coordinateVerifiedAt')
      ) {
        errors.push(`${label}: coordinate metadata requires coordinates.`);
      }
      continue;
    }

    if (
      typeof place.latitude !== 'number' ||
      typeof place.longitude !== 'number' ||
      !Number.isFinite(place.latitude) ||
      !Number.isFinite(place.longitude) ||
      place.latitude < -90 ||
      place.latitude > 90 ||
      place.longitude < -180 ||
      place.longitude > 180
    ) {
      errors.push(`${label}: coordinates must be finite WGS84 latitude/longitude values.`);
      continue;
    }

    if (place.latitude === 0 && place.longitude === 0) {
      errors.push(`${label}: coordinates must not use the 0,0 placeholder.`);
      continue;
    }

    if (!coordinateStatuses.has(place.coordinateStatus)) {
      errors.push(`${label}: coordinateStatus must be osm-unverified or field-verified.`);
    }

    if (typeof place.coordinateSource !== 'string' || !place.coordinateSource.trim()) {
      errors.push(`${label}: coordinateSource must be a non-empty string.`);
    }

    if (
      place.coordinateStatus === 'field-verified' &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(place.coordinateVerifiedAt ?? '') ||
        Number.isNaN(Date.parse(`${place.coordinateVerifiedAt}T00:00:00Z`)) ||
        new Date(`${place.coordinateVerifiedAt}T00:00:00Z`).toISOString().slice(0, 10) !==
          place.coordinateVerifiedAt)
    ) {
      errors.push(`${label}: field-verified coordinates require a valid coordinateVerifiedAt date.`);
    }

    if (place.coordinateStatus === 'osm-unverified' && place.coordinateVerifiedAt !== undefined) {
      errors.push(`${label}: osm-unverified coordinates must not have a verification date.`);
    }

    locatedCount += 1;
    const coordinateKey = `${place.latitude},${place.longitude}`;
    const previousPlace = coordinatesByPlace.get(coordinateKey);

    if (previousPlace) {
      errors.push(`${label}: coordinates duplicate ${previousPlace}.`);
    } else {
      coordinatesByPlace.set(coordinateKey, label);
    }
  }

  return { errors, locatedCount };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const placesPath = fileURLToPath(new URL('../src/assets/data/places.json', import.meta.url));
  const places = JSON.parse(readFileSync(placesPath, 'utf8'));
  const { errors, locatedCount } = validatePlaceCoordinates(places);

  if (errors.length) {
    console.error('Place coordinate validation failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `Validated ${places.length} place records: ${locatedCount} located, ${places.length - locatedCount} without coordinates.`,
    );
  }
}
