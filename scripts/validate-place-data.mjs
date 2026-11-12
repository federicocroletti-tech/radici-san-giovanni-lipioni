import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const locales = ['it', 'en', 'fr'];
const sourceStatuses = new Set(['verified', 'to-verify', 'research']);
const imageTypes = new Set(['placeholder-illustration', 'photograph']);
const imageStatuses = new Set([
  'rights-unverified',
  'user-declared-authorized-details-unrecorded',
  'rights-documented',
]);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateLocalizedText(value, label, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${label}: localized text must be an object.`);
    return;
  }

  for (const locale of locales) {
    if (!isNonEmptyString(value[locale])) {
      errors.push(`${label}: ${locale} text must be a non-empty string.`);
    }
  }
}

function validateAssetReference(assetPath, label, sourceDirectory, errors) {
  if (!isNonEmptyString(assetPath) || !assetPath.startsWith('assets/')) {
    errors.push(`${label}: path must be a non-empty local assets/ path.`);
    return;
  }

  const resolvedPath = resolve(sourceDirectory, assetPath);
  const relativePath = relative(sourceDirectory, resolvedPath);

  if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    errors.push(`${label}: path must remain inside the source directory.`);
    return;
  }

  try {
    if (!statSync(resolvedPath).isFile()) {
      errors.push(`${label}: path is not a file (${assetPath}).`);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    errors.push(`${label}: file does not exist (${assetPath}).`);
  }
}

export function validatePlaceData(places, categories, imageAssets, sources, sourceDirectory) {
  const errors = [];

  if (!Array.isArray(places)) {
    return { errors: ['Place data must be a JSON array.'] };
  }

  if (!Array.isArray(categories)) {
    return { errors: ['Place categories must be a JSON array.'] };
  }

  if (!Array.isArray(imageAssets)) {
    return { errors: ['Image asset data must be a JSON array.'] };
  }

  if (!Array.isArray(sources)) {
    return { errors: ['Source data must be a JSON array.'] };
  }

  if (!isNonEmptyString(sourceDirectory)) {
    return { errors: ['Source directory must be provided.'] };
  }

  const imageAssetsByPath = new Map();
  for (const [index, asset] of imageAssets.entries()) {
    const label = isNonEmptyString(asset?.path) ? asset.path : `image asset ${index + 1}`;

    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) {
      errors.push(`${label}: record must be an object.`);
      continue;
    }

    if (!isNonEmptyString(asset.path)) {
      errors.push(`${label}: path must be a non-empty string.`);
    } else if (imageAssetsByPath.has(asset.path)) {
      errors.push(`${asset.path}: duplicate image asset path.`);
    } else {
      imageAssetsByPath.set(asset.path, asset);
      validateAssetReference(asset.path, label, sourceDirectory, errors);
    }

    if (!imageTypes.has(asset.type)) {
      errors.push(`${label}: type must be placeholder-illustration or photograph.`);
    }

    if (!imageStatuses.has(asset.status)) {
      errors.push(
        `${label}: status must be rights-unverified, user-declared-authorized-details-unrecorded, or rights-documented.`,
      );
    }

    for (const field of ['author', 'source', 'license', 'attribution']) {
      if (asset[field] !== null && !isNonEmptyString(asset[field])) {
        errors.push(`${label}: ${field} must be a non-empty string or null.`);
      }

      if (asset.status === 'rights-documented' && !isNonEmptyString(asset[field])) {
        errors.push(`${label}: ${field} is required when rights are documented.`);
      }
    }

    if (!isNonEmptyString(asset.notes)) {
      errors.push(`${label}: notes must be a non-empty string.`);
    }
  }

  const categoryIds = new Set(
    categories
      .filter((category) => category && typeof category.id === 'string')
      .map((category) => category.id),
  );
  const placeIds = new Set(
    places.filter((place) => place && typeof place.id === 'string').map((place) => place.id),
  );
  const supportedPlaceIds = new Set();

  const sourceIds = new Set();
  for (const [index, source] of sources.entries()) {
    const label = isNonEmptyString(source?.id) ? source.id : `source ${index + 1}`;

    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      errors.push(`${label}: record must be an object.`);
      continue;
    }

    if (!isNonEmptyString(source.id)) {
      errors.push(`${label}: id must be a non-empty string.`);
    } else if (sourceIds.has(source.id)) {
      errors.push(`${source.id}: duplicate source id.`);
    } else {
      sourceIds.add(source.id);
    }

    for (const field of ['title', 'citation']) {
      if (!isNonEmptyString(source[field])) {
        errors.push(`${label}: ${field} must be a non-empty string.`);
      }
    }

    for (const field of ['creator', 'publisher']) {
      if (source[field] !== null && !isNonEmptyString(source[field])) {
        errors.push(`${label}: ${field} must be a non-empty string or null.`);
      }
    }

    if (source.creator === null && source.publisher === null) {
      errors.push(`${label}: creator or publisher is required.`);
    }

    if (
      source.url !== null &&
      (!isNonEmptyString(source.url) || !/^https?:\/\//i.test(source.url))
    ) {
      errors.push(`${label}: url must be an http(s) URL or null.`);
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(source.consultedAt ?? '') ||
      Number.isNaN(Date.parse(`${source.consultedAt}T00:00:00Z`)) ||
      new Date(`${source.consultedAt}T00:00:00Z`).toISOString().slice(0, 10) !== source.consultedAt
    ) {
      errors.push(`${label}: consultedAt must be a valid YYYY-MM-DD date.`);
    }

    if (!Array.isArray(source.supports) || source.supports.length === 0) {
      errors.push(`${label}: supports must contain at least one place claim.`);
      continue;
    }

    for (const [supportIndex, support] of source.supports.entries()) {
      const supportLabel = `${label} support ${supportIndex + 1}`;
      if (!support || typeof support !== 'object' || Array.isArray(support)) {
        errors.push(`${supportLabel}: record must be an object.`);
        continue;
      }

      if (!isNonEmptyString(support.placeId) || !placeIds.has(support.placeId)) {
        errors.push(`${supportLabel}: placeId must reference an existing place.`);
      } else {
        supportedPlaceIds.add(support.placeId);
      }

      if (!Array.isArray(support.claims) || support.claims.length === 0) {
        errors.push(`${supportLabel}: claims must contain at least one non-empty string.`);
      } else if (support.claims.some((claim) => !isNonEmptyString(claim))) {
        errors.push(`${supportLabel}: claims must contain at least one non-empty string.`);
      }
    }
  }

  for (const [label, records] of [
    ['category', categories],
    ['place', places],
  ]) {
    const seenIds = new Set();
    for (const record of records) {
      if (!isNonEmptyString(record?.id)) {
        continue;
      }

      if (seenIds.has(record.id)) {
        errors.push(`${record.id}: duplicate ${label} id.`);
      } else {
        seenIds.add(record.id);
      }
    }
  }

  for (const [index, place] of places.entries()) {
    const label = isNonEmptyString(place?.id) ? place.id : `record ${index + 1}`;

    if (!place || typeof place !== 'object' || Array.isArray(place)) {
      errors.push(`${label}: record must be an object.`);
      continue;
    }

    if (!isNonEmptyString(place.id)) {
      errors.push(`${label}: id must be a non-empty string.`);
    }

    validateLocalizedText(place.name, `${label} name`, errors);
    validateLocalizedText(place.shortDescription, `${label} shortDescription`, errors);
    validateLocalizedText(place.description, `${label} description`, errors);
    validateLocalizedText(place.alt, `${label} alt`, errors);
    validateLocalizedText(place.sourceNotes, `${label} sourceNotes`, errors);

    if (!categoryIds.has(place.category)) {
      errors.push(`${label}: category must reference an existing category.`);
    }

    if (!sourceStatuses.has(place.sourceStatus)) {
      errors.push(`${label}: sourceStatus must be verified, to-verify, or research.`);
    }

    if (typeof place.isVerifiedContent !== 'boolean') {
      errors.push(`${label}: isVerifiedContent must be a boolean.`);
    }

    if (place.sourceStatus === 'verified' && place.isVerifiedContent !== true) {
      errors.push(`${label}: verified sourceStatus requires isVerifiedContent to be true.`);
    }

    if (place.isVerifiedContent === true && place.sourceStatus !== 'verified') {
      errors.push(`${label}: verified content requires sourceStatus to be verified.`);
    }

    if (place.sourceStatus === 'verified' && !supportedPlaceIds.has(place.id)) {
      errors.push(`${label}: verified content must be supported by a registered source.`);
    }

    if (!imageAssetsByPath.has(place.image)) {
      errors.push(`${label}: image must reference an entry in the image asset inventory.`);
    }
    validateAssetReference(place.image, `${label} image`, sourceDirectory, errors);

    if (Object.hasOwn(place, 'detailsPath')) {
      validateAssetReference(place.detailsPath, `${label} detailsPath`, sourceDirectory, errors);
    }

    if (!Array.isArray(place.tags) || place.tags.some((tag) => !isNonEmptyString(tag))) {
      errors.push(`${label}: tags must be an array of non-empty strings.`);
    }

    if (
      !Array.isArray(place.relatedPlaceIds) ||
      place.relatedPlaceIds.some((relatedId) => !isNonEmptyString(relatedId))
    ) {
      errors.push(`${label}: relatedPlaceIds must be an array of non-empty strings.`);
    } else {
      for (const relatedId of place.relatedPlaceIds) {
        if (!placeIds.has(relatedId)) {
          errors.push(`${label}: related place ${relatedId} does not exist.`);
        }
      }
    }
  }

  return { errors };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const sourceDirectory = resolve(scriptDirectory, '../src');
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
  const { errors } = validatePlaceData(places, categories, imageAssets, sources, sourceDirectory);

  if (errors.length) {
    console.error('Place data validation failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `Validated ${places.length} place records, ${imageAssets.length} inventoried images, ${sources.length} sources, and declared detail sheets.`,
    );
  }
}
