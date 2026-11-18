import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateTimelineData } from './validate-timeline-data.mjs';

const text = { it: 'Titolo', en: 'Title', fr: 'Titre' };
const places = [{ id: 'chiesa-santa-maria' }];
const sources = [{ id: 'fonte-1' }];

function event(overrides = {}) {
  return {
    id: 'evento-1',
    kind: 'storico',
    dateLabel: 'XVII secolo',
    title: text,
    summary: text,
    sourceStatus: 'to-verify',
    sourceIds: ['fonte-1'],
    placeId: 'chiesa-santa-maria',
    ...overrides,
  };
}

test('accepts a valid timeline event', () => {
  assert.deepEqual(validateTimelineData([event()], places, sources).errors, []);
});

test('rejects an unknown source id', () => {
  const { errors } = validateTimelineData([event({ sourceIds: ['assente'] })], places, sources);
  assert.ok(errors.some((error) => error.includes('source assente does not exist')));
});

test('rejects an event without any source', () => {
  const { errors } = validateTimelineData([event({ sourceIds: [] })], places, sources);
  assert.ok(errors.some((error) => error.includes('at least one registered source')));
});

test('rejects an unknown kind and an unknown placeId', () => {
  const { errors } = validateTimelineData(
    [event({ kind: 'leggenda', placeId: 'luogo-inesistente' })],
    places,
    sources,
  );
  assert.ok(errors.some((error) => error.includes('kind must be')));
  assert.ok(errors.some((error) => error.includes('placeId must reference')));
});

test('rejects duplicate ids', () => {
  const { errors } = validateTimelineData([event(), event()], places, sources);
  assert.ok(errors.some((error) => error.includes('duplicate timeline id')));
});

test('committed timeline.json is valid against committed places and sources', () => {
  const dataDir = resolve(import.meta.dirname, '../src/assets/data');
  const read = (file) => JSON.parse(readFileSync(resolve(dataDir, file), 'utf8'));
  const { errors } = validateTimelineData(
    read('timeline.json'),
    read('places.json'),
    read('sources.json'),
  );
  assert.deepEqual(errors, []);
});
