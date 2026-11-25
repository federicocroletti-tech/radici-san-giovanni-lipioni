import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validateLocalizedText } from './validate-place-data.mjs';

const verificationStatuses = new Set(['unverified', 'field-verified']);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}

export function validateItineraryData(itineraries, places) {
  const errors = [];

  if (!Array.isArray(itineraries)) {
    return { errors: ['Itinerary data must be a JSON array.'] };
  }

  if (!Array.isArray(places)) {
    return { errors: ['Place data must be a JSON array.'] };
  }

  const placesById = new Map(
    places.filter((place) => place && typeof place.id === 'string').map((place) => [place.id, place]),
  );
  const seenIds = new Set();

  for (const [index, itinerary] of itineraries.entries()) {
    const label = isNonEmptyString(itinerary?.id) ? itinerary.id : `itinerary ${index + 1}`;

    if (!itinerary || typeof itinerary !== 'object' || Array.isArray(itinerary)) {
      errors.push(`${label}: record must be an object.`);
      continue;
    }

    if (!isNonEmptyString(itinerary.id)) {
      errors.push(`${label}: id must be a non-empty string.`);
    } else if (seenIds.has(itinerary.id)) {
      errors.push(`${itinerary.id}: duplicate itinerary id.`);
    } else {
      seenIds.add(itinerary.id);
    }

    for (const field of ['title', 'duration', 'difficulty', 'shortDescription', 'description']) {
      validateLocalizedText(itinerary[field], `${label} ${field}`, errors);
    }

    if (!Array.isArray(itinerary.tags) || itinerary.tags.length === 0) {
      errors.push(`${label}: tags must contain at least one non-empty string.`);
    } else if (itinerary.tags.some((tag) => !isNonEmptyString(tag))) {
      errors.push(`${label}: tags must contain at least one non-empty string.`);
    }

    if (!Array.isArray(itinerary.placeIds) || itinerary.placeIds.length === 0) {
      errors.push(`${label}: placeIds must contain at least one existing place.`);
    } else {
      const seenPlaceIds = new Set();
      for (const placeId of itinerary.placeIds) {
        if (!isNonEmptyString(placeId) || !placesById.has(placeId)) {
          errors.push(`${label}: place ${placeId} does not exist.`);
        } else if (seenPlaceIds.has(placeId)) {
          errors.push(`${label}: duplicate stop ${placeId}.`);
        } else {
          seenPlaceIds.add(placeId);
        }
      }
    }

    if (!verificationStatuses.has(itinerary.verificationStatus)) {
      errors.push(`${label}: verificationStatus must be unverified or field-verified.`);
      continue;
    }

    if (itinerary.verificationStatus === 'unverified') {
      if (itinerary.fieldVerification !== undefined) {
        errors.push(`${label}: unverified itinerary must not include fieldVerification.`);
      }
      continue;
    }

    const verification = itinerary.fieldVerification;
    if (!verification || typeof verification !== 'object' || Array.isArray(verification)) {
      errors.push(`${label}: field-verified itinerary requires fieldVerification details.`);
      continue;
    }

    if (!isValidDate(verification.verifiedAt)) {
      errors.push(`${label}: fieldVerification.verifiedAt must be a valid YYYY-MM-DD date.`);
    }

    if (!isNonEmptyString(verification.source)) {
      errors.push(`${label}: fieldVerification.source must be a non-empty string.`);
    }

    if (!Number.isFinite(verification.distanceMeters) || verification.distanceMeters <= 0) {
      errors.push(`${label}: fieldVerification.distanceMeters must be a positive number.`);
    }

    if (!Number.isFinite(verification.durationMinutes) || verification.durationMinutes <= 0) {
      errors.push(`${label}: fieldVerification.durationMinutes must be a positive number.`);
    }

    validateLocalizedText(verification.difficulty, `${label} fieldVerification difficulty`, errors);
    validateLocalizedText(
      verification.accessibility,
      `${label} fieldVerification accessibility`,
      errors,
    );

    if (Array.isArray(itinerary.placeIds)) {
      for (const placeId of itinerary.placeIds) {
        const place = placesById.get(placeId);
        if (
          place &&
          (place.coordinateStatus !== 'field-verified' ||
            !Number.isFinite(place.latitude) ||
            !Number.isFinite(place.longitude))
        ) {
          errors.push(
            `${label}: field-verified itinerary stop ${placeId} must have field-verified coordinates.`,
          );
        }
      }
    }
  }

  return { errors };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const sourceDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
  const readData = (file) =>
    JSON.parse(readFileSync(resolve(sourceDirectory, 'assets/data', file), 'utf8'));
  const itineraries = readData('itineraries.json');
  const { errors } = validateItineraryData(itineraries, readData('places.json'));

  if (errors.length) {
    console.error('Itinerary data validation failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Validated ${itineraries.length} itinerary records.`);
  }
}
