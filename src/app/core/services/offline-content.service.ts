import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { LanguageCode } from '../models/localized-text.model';

export type OfflineContentError = 'unavailable' | 'failed' | 'invalid';
export type OfflineContentType = 'itinerary' | 'story' | 'place';

export interface OfflineContentBundle {
  id: string;
  type: OfflineContentType;
  title: string;
  language: string;
  content: unknown;
  imagePaths: string[];
}

export interface OfflineContentPackage {
  id: string;
  type: OfflineContentType;
  title: string;
  language: string;
  createdAt: string;
  sizeBytes: number;
  imageUrls: string[];
}

const CACHE_NAME = 'radici-offline-content-v1';
const STORAGE_KEY = 'radici-offline-packages-v1';
const PACKAGE_PATH = '/__offline-content__/';
const DATE_LOCALES: Record<LanguageCode, string> = {
  it: 'it-IT',
  en: 'en-US',
  fr: 'fr-FR',
};

export function formatOfflinePackageSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  return `${(sizeBytes / 1024).toFixed(1)} KB`;
}

export function formatOfflinePackageDate(createdAt: string, language: LanguageCode): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[language], { dateStyle: 'medium' }).format(
    new Date(createdAt),
  );
}

@Injectable({ providedIn: 'root' })
export class OfflineContentService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly packages = signal<OfflineContentPackage[]>([]);
  readonly activePackageId = signal<string | null>(null);
  readonly errorPackageId = signal<string | null>(null);
  readonly error = signal<OfflineContentError | null>(null);
  readonly progress = signal(0);

  initialize(): void {
    if (this.isBrowser) this.readStoredPackages();
  }

  isDownloaded(id: string): boolean {
    return this.packages().some((offlinePackage) => offlinePackage.id === id);
  }

  getPackage(id: string): OfflineContentPackage | null {
    return this.packages().find((offlinePackage) => offlinePackage.id === id) ?? null;
  }

  async save(bundle: OfflineContentBundle, refresh = false): Promise<void> {
    const view = this.browserWindow();
    if (!view?.caches || !view.fetch || !view.localStorage) {
      this.setError(bundle.id, 'unavailable');
      return;
    }
    if (refresh && !view.navigator.onLine) {
      this.setError(bundle.id, 'failed');
      return;
    }

    if (!bundle.id.trim() || !bundle.title.trim() || !bundle.language.trim()) {
      this.setError(bundle.id, 'invalid');
      return;
    }

    let imageUrls: string[];
    try {
      imageUrls = this.resolveImageUrls(bundle.imagePaths, view);
    } catch {
      this.setError(bundle.id, 'invalid');
      return;
    }

    this.activePackageId.set(bundle.id);
    this.error.set(null);
    this.errorPackageId.set(null);
    this.progress.set(0);
    const newlyCachedImages: string[] = [];
    const previousImages = new Map<string, Response>();
    let cache: Cache | null = null;
    let previousPackageResponse: Response | undefined;

    try {
      cache = await view.caches.open(CACHE_NAME);
      const packageUrl = this.packageUrl(bundle.id, view);
      previousPackageResponse = await cache.match(packageUrl);
      const serializedContent = JSON.stringify(bundle.content);
      if (serializedContent === undefined) {
        this.setError(bundle.id, 'invalid');
        return;
      }

      let sizeBytes = new TextEncoder().encode(serializedContent).byteLength;
      for (const [index, imageUrl] of imageUrls.entries()) {
        let response = await cache.match(imageUrl);
        if (refresh && response) previousImages.set(imageUrl, response.clone());
        if (!response || refresh) {
          const downloadedImage = await view.fetch(
            imageUrl,
            refresh ? { cache: 'reload' } : undefined,
          );
          if (!downloadedImage.ok) {
            throw new Error(`Image download failed with status ${downloadedImage.status}`);
          }
          response = downloadedImage;
          await cache.put(imageUrl, downloadedImage.clone());
          if (!previousImages.has(imageUrl) && !newlyCachedImages.includes(imageUrl)) {
            newlyCachedImages.push(imageUrl);
          }
        }
        sizeBytes += (await response.clone().arrayBuffer()).byteLength;
        this.progress.set(Math.round(((index + 1) / Math.max(imageUrls.length, 1)) * 100));
      }

      const offlinePackage: OfflineContentPackage = {
        id: bundle.id,
        type: bundle.type,
        title: bundle.title,
        language: bundle.language,
        createdAt: new Date().toISOString(),
        sizeBytes,
        imageUrls,
      };
      const packageResponse = new Response(
        JSON.stringify({ ...offlinePackage, content: bundle.content }),
        { headers: { 'Content-Type': 'application/json' } },
      );
      await cache.put(this.packageUrl(bundle.id, view), packageResponse);

      const nextPackages = [
        ...this.packages().filter((savedPackage) => savedPackage.id !== bundle.id),
        offlinePackage,
      ];
      view.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPackages));
      this.packages.set(nextPackages);
      this.progress.set(100);
    } catch {
      if (cache) {
        if (previousPackageResponse) {
          await cache.put(this.packageUrl(bundle.id, view), previousPackageResponse);
        } else {
          await cache.delete(this.packageUrl(bundle.id, view));
        }
        for (const [imageUrl, response] of previousImages) {
          await cache.put(imageUrl, response);
        }
        await this.deleteUnreferencedImages(newlyCachedImages, this.packages(), cache);
      }
      this.setError(bundle.id, 'failed');
    } finally {
      this.activePackageId.set(null);
    }
  }

  async remove(id: string): Promise<void> {
    const view = this.browserWindow();
    if (!view?.caches || !view.localStorage) {
      this.setError(id, 'unavailable');
      return;
    }

    const removedPackage = this.packages().find((savedPackage) => savedPackage.id === id);
    if (!removedPackage) return;

    try {
      const cache = await view.caches.open(CACHE_NAME);
      const nextPackages = this.packages().filter((savedPackage) => savedPackage.id !== id);
      view.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPackages));
      this.packages.set(nextPackages);
      await cache.delete(this.packageUrl(id, view));
      await this.deleteUnreferencedImages(removedPackage.imageUrls, nextPackages, cache);
      this.error.set(null);
      this.errorPackageId.set(null);
    } catch {
      this.setError(id, 'failed');
    }
  }

  async resolveImagePath(imagePath: string): Promise<string> {
    const view = this.browserWindow();
    if (!view || view.navigator.onLine) return imagePath;

    const imageUrl = this.resolveImageUrls([imagePath], view)[0];
    if (!imageUrl || !view.caches) return imagePath;

    const cache = await view.caches.open(CACHE_NAME);
    const response = await cache.match(imageUrl);
    if (!response) return imagePath;
    return URL.createObjectURL(await response.blob());
  }

  private readStoredPackages(): void {
    const view = this.browserWindow();
    if (!view?.localStorage) return;

    const rawPackages = view.localStorage.getItem(STORAGE_KEY);
    if (!rawPackages) return;

    try {
      const parsed: unknown = JSON.parse(rawPackages);
      if (!Array.isArray(parsed) || !parsed.every(isOfflineContentPackage)) {
        this.setError('offline-packages', 'invalid');
        return;
      }
      this.packages.set(parsed);
    } catch {
      this.setError('offline-packages', 'invalid');
    }
  }

  private resolveImageUrls(imagePaths: string[], view: Window): string[] {
    const urls = imagePaths.map((imagePath) => {
      const url = new URL(imagePath, view.location.href);
      if (
        url.origin !== view.location.origin ||
        !url.pathname.includes('/assets/images/') ||
        url.search ||
        url.hash
      ) {
        throw new Error('Offline packages only support local guide images');
      }
      return url.toString();
    });
    return [...new Set(urls)];
  }

  private packageUrl(id: string, view: Window): string {
    return new URL(`${PACKAGE_PATH}${encodeURIComponent(id)}.json`, view.location.origin).toString();
  }

  private browserWindow(): Window | null {
    return this.isBrowser ? this.document.defaultView : null;
  }

  private async deleteUnreferencedImages(
    imageUrls: string[],
    savedPackages: OfflineContentPackage[],
    cache: Cache,
  ): Promise<void> {
    const referencedUrls = new Set(savedPackages.flatMap((savedPackage) => savedPackage.imageUrls));
    for (const imageUrl of imageUrls) {
      if (!referencedUrls.has(imageUrl)) await cache.delete(imageUrl);
    }
  }

  private setError(id: string, error: OfflineContentError): void {
    this.errorPackageId.set(id);
    this.error.set(error);
  }
}

function isOfflineContentPackage(value: unknown): value is OfflineContentPackage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    (candidate['type'] === 'itinerary' ||
      candidate['type'] === 'story' ||
      candidate['type'] === 'place') &&
    typeof candidate['title'] === 'string' &&
    typeof candidate['language'] === 'string' &&
    typeof candidate['createdAt'] === 'string' &&
    typeof candidate['sizeBytes'] === 'number' &&
    Array.isArray(candidate['imageUrls']) &&
    candidate['imageUrls'].every((url) => typeof url === 'string')
  );
}
