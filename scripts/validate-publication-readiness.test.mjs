import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import {
  findPublishedImagePaths,
  validatePublicationReadiness,
} from './validate-publication-readiness.mjs';

const projectDirectory = resolve(import.meta.dirname, '..');
const dataDirectory = resolve(projectDirectory, 'src/assets/data');
const readData = (file) => JSON.parse(readFileSync(resolve(dataDirectory, file), 'utf8'));

const source = {
  id: 'source-1',
  supports: [{ placeId: 'place-one', claims: ['Claim supported by the test fixture.'] }],
};
const documentedImage = {
  path: 'assets/images/place-one.svg',
  type: 'placeholder-illustration',
  status: 'rights-documented',
  author: 'Test author',
  source: 'https://example.test/image',
  license: 'CC BY 4.0',
  attribution: 'Test author, CC BY 4.0',
};

function publicationData(overrides = {}) {
  return {
    places: [
      {
        id: 'place-one',
        sourceStatus: 'verified',
        isVerifiedContent: true,
        editorialStatus: 'published',
        latitude: 41.84,
        longitude: 14.56,
        coordinateStatus: 'field-verified',
        coordinateVerifiedAt: '2026-11-25',
        coordinateSource: 'Field survey record F-01',
        image: documentedImage.path,
      },
    ],
    itineraries: [],
    timeline: [],
    stories: [],
    imageAssets: [documentedImage],
    sources: [source],
    ...overrides,
  };
}

test('accepts only documented, verified publication records', () => {
  assert.deepEqual(
    validatePublicationReadiness(publicationData(), [documentedImage.path]).errors,
    [],
  );
});

test('blocks unverified places, routes, claims, mock stories, and undocumented images', () => {
  const data = publicationData({
    places: [
      {
        ...publicationData().places[0],
        sourceStatus: 'to-verify',
        editorialStatus: 'draft',
        coordinateStatus: 'osm-unverified',
        coordinateVerifiedAt: undefined,
      },
    ],
    itineraries: [{ id: 'route-one', verificationStatus: 'unverified' }],
    timeline: [
      {
        id: 'claim-one',
        sourceStatus: 'to-verify',
        sourceIds: ['source-1'],
        placeId: 'place-one',
      },
    ],
    stories: [{ id: 'story-one', isMock: true }],
    imageAssets: [{ ...documentedImage, status: 'rights-unverified' }],
  });

  const { errors } = validatePublicationReadiness(data, [
    documentedImage.path,
    'public/images/not-in-inventory.png',
  ]);

  assert.ok(errors.includes('place-one: publication requires verified editorial content.'));
  assert.ok(errors.includes('place-one: editorialStatus must be published.'));
  assert.ok(errors.includes('place-one: publication requires dated, sourced, field-verified coordinates.'));
  assert.ok(errors.includes('route-one: publication requires field-verified route data.'));
  assert.ok(errors.includes('claim-one: publication requires verified historical/cultural claims.'));
  assert.ok(errors.includes('story-one: demo/mock story cannot be published as a real testimony.'));
  assert.ok(errors.includes(`${documentedImage.path}: publication requires documented image rights.`));
  assert.ok(
    errors.includes(
      'public/images/not-in-inventory.png: published image is missing from the image asset inventory.',
    ),
  );
});

test('requires a consent record and complete image rights before publication', () => {
  const { errors } = validatePublicationReadiness(
    publicationData({
      stories: [
        {
          id: 'story-one',
          isMock: false,
          sourceStatus: 'verified',
          editorialStatus: 'published',
          consentRequiredNotice: {},
        },
      ],
      imageAssets: [{ ...documentedImage, author: null }],
    }),
    [documentedImage.path],
  );

  assert.ok(errors.includes('story-one: publication requires documented consent evidence and scope.'));
  assert.ok(errors.includes(`${documentedImage.path}: author is required for publication.`));
});

test('current repository content is not release-ready', () => {
  const data = {
    places: readData('places.json'),
    itineraries: readData('itineraries.json'),
    timeline: readData('timeline.json'),
    stories: readData('stories.json'),
    imageAssets: readData('image-assets.json'),
    sources: readData('sources.json'),
  };
  const { errors } = validatePublicationReadiness(
    data,
    findPublishedImagePaths(projectDirectory),
  );

  assert.ok(errors.some((error) => error.includes('publication requires verified editorial content')));
  assert.ok(errors.some((error) => error.includes('demo/mock story cannot be published')));
  assert.ok(errors.some((error) => error.includes('publication requires documented image rights')));
  assert.ok(
    errors.every(
      (error) =>
        !error.includes('published image is missing from the image asset inventory') &&
        !error.includes('inventoried image file does not exist'),
    ),
  );
});

test('discovers and inventories every image file in application and public assets', () => {
  const imagePaths = findPublishedImagePaths(projectDirectory);
  const manifestPaths = new Set(readData('image-assets.json').map((asset) => asset.path));

  assert.ok(imagePaths.some((imagePath) => imagePath.startsWith('assets/images/')));
  assert.ok(imagePaths.some((imagePath) => imagePath.startsWith('public/')));
  assert.deepEqual(imagePaths.filter((imagePath) => !manifestPaths.has(imagePath)), []);
  assert.deepEqual([...manifestPaths].filter((imagePath) => !imagePaths.includes(imagePath)), []);
});
