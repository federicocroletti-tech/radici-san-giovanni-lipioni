import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const imageExtensions = new Set(['.avif', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.svg', '.webp']);
const requiredImageRightsFields = ['author', 'source', 'license', 'attribution'];

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

export function findPublishedImagePaths(projectDirectory) {
  const imagePaths = [];
  const locations = [
    { directory: resolve(projectDirectory, 'src/assets/images'), prefix: 'assets/images' },
    { directory: resolve(projectDirectory, 'public'), prefix: 'public' },
  ];

  for (const { directory, prefix } of locations) {
    const visit = (currentDirectory, relativeDirectory = '') => {
      for (const entry of readdirSync(currentDirectory, { withFileTypes: true })) {
        const entryPath = resolve(currentDirectory, entry.name);
        const entryRelativePath = relativeDirectory
          ? `${relativeDirectory}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          visit(entryPath, entryRelativePath);
        } else if (entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase())) {
          imagePaths.push(`${prefix}/${entryRelativePath}`.replaceAll('\\', '/'));
        }
      }
    };

    visit(directory);
  }

  return imagePaths.sort();
}

function sourceSupportsPlace(source, placeId) {
  return (
    Array.isArray(source?.supports) &&
    source.supports.some(
      (support) =>
        support?.placeId === placeId &&
        Array.isArray(support.claims) &&
        support.claims.some(isNonEmptyString),
    )
  );
}

export function validatePublicationReadiness(
  { places, itineraries, timeline, stories, imageAssets, sources },
  availableImagePaths,
) {
  const errors = [];

  for (const [label, records] of [
    ['places', places],
    ['itineraries', itineraries],
    ['timeline', timeline],
    ['stories', stories],
    ['image assets', imageAssets],
    ['sources', sources],
  ]) {
    if (!Array.isArray(records)) {
      errors.push(`${label}: data must be a JSON array.`);
    }
  }

  if (!Array.isArray(availableImagePaths)) {
    errors.push('Published image paths must be an array.');
  }

  if (errors.length) {
    return { errors };
  }

  const sourcesById = new Map(
    sources.filter((source) => isNonEmptyString(source?.id)).map((source) => [source.id, source]),
  );
  const imageAssetsByPath = new Map();

  for (const [index, asset] of imageAssets.entries()) {
    const label = isNonEmptyString(asset?.path) ? asset.path : `image asset ${index + 1}`;

    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) {
      errors.push(`${label}: record must be an object.`);
      continue;
    }

    if (!isNonEmptyString(asset.path)) {
      errors.push(`${label}: path must be a non-empty string.`);
      continue;
    }

    if (imageAssetsByPath.has(asset.path)) {
      errors.push(`${asset.path}: duplicate image asset path.`);
      continue;
    }

    imageAssetsByPath.set(asset.path, asset);

    if (asset.status !== 'rights-documented') {
      errors.push(`${label}: publication requires documented image rights.`);
    }

    if (asset.status === 'rights-documented') {
      for (const field of requiredImageRightsFields) {
        if (!isNonEmptyString(asset[field])) {
          errors.push(`${label}: ${field} is required for publication.`);
        }
      }
    }
  }

  const discoveredImagePaths = new Set(availableImagePaths);
  for (const imagePath of availableImagePaths) {
    if (!imageAssetsByPath.has(imagePath)) {
      errors.push(`${imagePath}: published image is missing from the image asset inventory.`);
    }
  }

  for (const imagePath of imageAssetsByPath.keys()) {
    if (!discoveredImagePaths.has(imagePath)) {
      errors.push(`${imagePath}: inventoried image file does not exist in a published asset directory.`);
    }
  }

  for (const [index, place] of places.entries()) {
    const label = isNonEmptyString(place?.id) ? place.id : `place ${index + 1}`;

    if (!place || typeof place !== 'object' || Array.isArray(place)) {
      errors.push(`${label}: record must be an object.`);
      continue;
    }

    if (place.sourceStatus !== 'verified' || place.isVerifiedContent !== true) {
      errors.push(`${label}: publication requires verified editorial content.`);
    }

    if (place.editorialStatus !== 'published') {
      errors.push(`${label}: editorialStatus must be published.`);
    }

    if (
      place.sourceStatus === 'verified' &&
      !sources.some((source) => sourceSupportsPlace(source, place.id))
    ) {
      errors.push(`${label}: verified content requires a registered supporting claim.`);
    }

    if (
      place.coordinateStatus !== 'field-verified' ||
      !Number.isFinite(place.latitude) ||
      !Number.isFinite(place.longitude) ||
      !isValidDate(place.coordinateVerifiedAt) ||
      !isNonEmptyString(place.coordinateSource)
    ) {
      errors.push(`${label}: publication requires dated, sourced, field-verified coordinates.`);
    }

    if (!imageAssetsByPath.has(place.image)) {
      errors.push(`${label}: image must be registered in the image asset inventory.`);
    } else if (imageAssetsByPath.get(place.image)?.status !== 'rights-documented') {
      errors.push(`${label}: publication requires documented rights for its image.`);
    }
  }

  for (const [index, itinerary] of itineraries.entries()) {
    const label = isNonEmptyString(itinerary?.id) ? itinerary.id : `itinerary ${index + 1}`;
    if (itinerary?.verificationStatus !== 'field-verified') {
      errors.push(`${label}: publication requires field-verified route data.`);
    }
  }

  for (const [index, event] of timeline.entries()) {
    const label = isNonEmptyString(event?.id) ? event.id : `timeline event ${index + 1}`;
    if (event?.sourceStatus !== 'verified') {
      errors.push(`${label}: publication requires verified historical/cultural claims.`);
    }

    if (!Array.isArray(event?.sourceIds) || event.sourceIds.length === 0) {
      errors.push(`${label}: publication requires registered claim sources.`);
      continue;
    }

    for (const sourceId of event.sourceIds) {
      const source = sourcesById.get(sourceId);
      if (!source) {
        errors.push(`${label}: source ${sourceId} is not registered.`);
      } else if (event.placeId && !sourceSupportsPlace(source, event.placeId)) {
        errors.push(`${label}: source ${sourceId} does not document place ${event.placeId}.`);
      }
    }
  }

  for (const [index, story] of stories.entries()) {
    const label = isNonEmptyString(story?.id) ? story.id : `story ${index + 1}`;

    if (story?.isMock !== false) {
      errors.push(`${label}: demo/mock story cannot be published as a real testimony.`);
      continue;
    }

    if (story.sourceStatus !== 'verified' || story.editorialStatus !== 'published') {
      errors.push(`${label}: real testimony requires verified, published editorial content.`);
    }

    const consent = story.consent;
    if (
      consent?.status !== 'documented' ||
      !isNonEmptyString(consent.recordRef) ||
      !isValidDate(consent.recordedAt) ||
      !Array.isArray(consent.scope) ||
      consent.scope.length === 0 ||
      consent.scope.some((scope) => !isNonEmptyString(scope))
    ) {
      errors.push(`${label}: publication requires documented consent evidence and scope.`);
    }
  }

  return { errors };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const dataDirectory = resolve(projectDirectory, 'src/assets/data');
  const readData = (file) => JSON.parse(readFileSync(resolve(dataDirectory, file), 'utf8'));
  const data = {
    places: readData('places.json'),
    itineraries: readData('itineraries.json'),
    timeline: readData('timeline.json'),
    stories: readData('stories.json'),
    imageAssets: readData('image-assets.json'),
    sources: readData('sources.json'),
  };
  const { errors } = validatePublicationReadiness(data, findPublishedImagePaths(projectDirectory));

  if (errors.length) {
    console.error('Publication readiness validation failed; deployment is blocked:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Publication readiness validation passed.');
  }
}
