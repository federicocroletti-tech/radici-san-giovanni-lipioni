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
