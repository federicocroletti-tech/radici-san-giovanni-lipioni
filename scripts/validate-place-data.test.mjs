import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePlaceData } from './validate-place-data.mjs';

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = resolve(projectDirectory, 'src');
const places = JSON.parse(
  readFileSync(resolve(sourceDirectory, 'assets/data/places.json'), 'utf8'),
);
const categories = JSON.parse(
  readFileSync(resolve(sourceDirectory, 'assets/data/categories.json'), 'utf8'),
);
const imageAssets = JSON.parse(
  readFileSync(resolve(sourceDirectory, 'assets/data/image-assets.json'), 'utf8'),
);
const sources = JSON.parse(
  readFileSync(resolve(sourceDirectory, 'assets/data/sources.json'), 'utf8'),
);

const testSource = {
  id: 'fonte-test',
  title: 'Riferimento sintetico per test automatici',
  creator: 'Fixture test',
  publisher: null,
  citation: 'Riferimento di test, non fonte editoriale.',
  url: null,
  consultedAt: '2026-11-12',
  supports: [
    { placeId: 'centro-storico', claims: ['Affermazione sintetica usata solo nei test.'] },
  ],
};

function updateFirstPlace(changes) {
  return places.map((place, index) => (index === 0 ? { ...place, ...changes } : place));
}

test('accepts repository place data and all referenced local assets', () => {
  assert.deepEqual(
    validatePlaceData(places, categories, imageAssets, sources, sourceDirectory).errors,
    [],
  );
});

test('rejects duplicate place and category identifiers', () => {
  const result = validatePlaceData(
    [...places, { ...places[0], id: places[1].id }],
    [...categories, { ...categories[0] }],
    imageAssets,
    sources,
    sourceDirectory,
  );

  assert.deepEqual(result.errors, [
    `${categories[0].id}: duplicate category id.`,
    `${places[1].id}: duplicate place id.`,
  ]);
});

test('rejects missing image and declared detail sheet files', () => {
  const result = validatePlaceData(
    updateFirstPlace({
      image: 'assets/images/not-present.svg',
      detailsPath: 'assets/content/places/not-present.md',
    }),
    categories,
    imageAssets,
    sources,
    sourceDirectory,
  );

  assert.deepEqual(result.errors, [
    'centro-storico: image must reference an entry in the image asset inventory.',
    'centro-storico image: file does not exist (assets/images/not-present.svg).',
    'centro-storico detailsPath: file does not exist (assets/content/places/not-present.md).',
  ]);
});

test('rejects invalid categories, source status, localized text, and related places', () => {
  const result = validatePlaceData(
    updateFirstPlace({
      category: 'missing-category',
      sourceStatus: 'unknown',
      name: { it: 'Nome', en: '', fr: 'Nom' },
      relatedPlaceIds: ['missing-place'],
    }),
    categories,
    imageAssets,
    sources,
    sourceDirectory,
  );

  assert.deepEqual(result.errors, [
    'centro-storico name: en text must be a non-empty string.',
    'centro-storico: category must reference an existing category.',
    'centro-storico: sourceStatus must be verified, to-verify, or research.',
    'centro-storico: related place missing-place does not exist.',
  ]);
});

test('rejects asset paths that escape the source directory', () => {
  const result = validatePlaceData(
    updateFirstPlace({ image: 'assets/../../outside.svg' }),
    categories,
    imageAssets,
    sources,
    sourceDirectory,
  );

  assert.deepEqual(result.errors, [
    'centro-storico: image must reference an entry in the image asset inventory.',
    'centro-storico image: path must remain inside the source directory.',
  ]);
});

test('requires a place image to be registered and rights-documented assets to have provenance', () => {
  const result = validatePlaceData(
    updateFirstPlace({ image: 'assets/images/not-in-inventory.svg' }),
    categories,
    [
      ...imageAssets,
      {
        path: 'assets/images/unverified.svg',
        type: 'placeholder-illustration',
        status: 'rights-documented',
        author: null,
        source: null,
        license: null,
        attribution: null,
        notes: 'Incomplete provenance.',
      },
    ],
    sources,
    sourceDirectory,
  );

  assert.deepEqual(result.errors, [
    'assets/images/unverified.svg: file does not exist (assets/images/unverified.svg).',
    'assets/images/unverified.svg: author is required when rights are documented.',
    'assets/images/unverified.svg: source is required when rights are documented.',
    'assets/images/unverified.svg: license is required when rights are documented.',
    'assets/images/unverified.svg: attribution is required when rights are documented.',
    'centro-storico: image must reference an entry in the image asset inventory.',
    'centro-storico image: file does not exist (assets/images/not-in-inventory.svg).',
  ]);
});

test('requires a registered source claim before content can be marked verified', () => {
  const verifiedPlace = updateFirstPlace({ sourceStatus: 'verified', isVerifiedContent: true });
  const unsupported = validatePlaceData(
    verifiedPlace,
    categories,
    imageAssets,
    sources,
    sourceDirectory,
  );

  assert.deepEqual(unsupported.errors, [
    'centro-storico: verified content must be supported by a registered source.',
  ]);
  assert.deepEqual(
    validatePlaceData(verifiedPlace, categories, imageAssets, [testSource], sourceDirectory).errors,
    [],
  );
});

test('rejects source claims that refer to missing places or have no claim text', () => {
  const result = validatePlaceData(
    places,
    categories,
    imageAssets,
    [
      {
        ...testSource,
        supports: [
          { placeId: 'missing-place', claims: ['Affermazione sintetica.'] },
          { placeId: 'centro-storico', claims: [] },
        ],
      },
    ],
    sourceDirectory,
  );

  assert.deepEqual(result.errors, [
    'fonte-test support 1: placeId must reference an existing place.',
    'fonte-test support 2: claims must contain at least one non-empty string.',
  ]);
});

test('requires source metadata and a valid consultation date', () => {
  const result = validatePlaceData(
    places,
    categories,
    imageAssets,
    [{ ...testSource, creator: null, publisher: null, consultedAt: '2026-02-31' }],
    sourceDirectory,
  );

  assert.deepEqual(result.errors, [
    'fonte-test: creator or publisher is required.',
    'fonte-test: consultedAt must be a valid YYYY-MM-DD date.',
  ]);
});
