import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validateLocalizedText } from './validate-place-data.mjs';

export const timelineKinds = new Set([
  'sismico',
  'storico',
  'persona',
  'emigrazione',
  'tradizione',
]);
const timelineSourceStatuses = new Set(['verified', 'to-verify', 'research']);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateTimelineData(timeline, places, sources) {
  const errors = [];

  if (!Array.isArray(timeline)) {
    return { errors: ['Timeline data must be a JSON array.'] };
  }

  const placeIds = new Set(
    places.filter((place) => place && typeof place.id === 'string').map((place) => place.id),
  );
  const sourceIds = new Set(
    sources.filter((source) => source && typeof source.id === 'string').map((source) => source.id),
  );
  const seenIds = new Set();

  for (const [index, event] of timeline.entries()) {
    const label = isNonEmptyString(event?.id) ? event.id : `event ${index + 1}`;

    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      errors.push(`${label}: record must be an object.`);
      continue;
    }

    if (!isNonEmptyString(event.id)) {
      errors.push(`${label}: id must be a non-empty string.`);
    } else if (seenIds.has(event.id)) {
      errors.push(`${event.id}: duplicate timeline id.`);
    } else {
      seenIds.add(event.id);
    }

    if (!timelineKinds.has(event.kind)) {
      errors.push(
        `${label}: kind must be sismico, storico, persona, emigrazione, or tradizione.`,
      );
    }

    if (!isNonEmptyString(event.dateLabel)) {
      errors.push(`${label}: dateLabel must be a non-empty string.`);
    }

    validateLocalizedText(event.title, `${label} title`, errors);
    validateLocalizedText(event.summary, `${label} summary`, errors);

    if (!timelineSourceStatuses.has(event.sourceStatus)) {
      errors.push(`${label}: sourceStatus must be verified, to-verify, or research.`);
    }

    if (!Array.isArray(event.sourceIds) || event.sourceIds.length === 0) {
      errors.push(`${label}: sourceIds must contain at least one registered source.`);
    } else {
      for (const sourceId of event.sourceIds) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`${label}: source ${sourceId} does not exist.`);
        }
      }
    }

    if (event.placeId !== undefined && event.placeId !== null && !placeIds.has(event.placeId)) {
      errors.push(`${label}: placeId must reference an existing place or be null.`);
    }
  }

  return { errors };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const sourceDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
  const readData = (file) => JSON.parse(readFileSync(resolve(sourceDirectory, 'assets/data', file), 'utf8'));
  const timeline = readData('timeline.json');
  const { errors } = validateTimelineData(
    timeline,
    readData('places.json'),
    readData('sources.json'),
  );

  if (errors.length) {
    console.error('Timeline data validation failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Validated ${timeline.length} timeline records.`);
  }
}
