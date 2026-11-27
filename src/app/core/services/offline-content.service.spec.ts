import '@angular/compiler';

import { DOCUMENT } from '@angular/common';
import { Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { OfflineContentService } from './offline-content.service';

function createService() {
  const entries = new Map<string, Response>();
  const cache: Partial<Cache> = {
    match: vi.fn(async (request: RequestInfo | URL) => {
      const url = typeof request === 'string' ? request : request.toString();
      return entries.get(url)?.clone();
    }),
    put: vi.fn(async (request: RequestInfo | URL, response: Response) => {
      const url = typeof request === 'string' ? request : request.toString();
      entries.set(url, response.clone());
    }),
    delete: vi.fn(async (request: RequestInfo | URL) => {
      const url = typeof request === 'string' ? request : request.toString();
      return entries.delete(url);
    }),
  };
  const cacheStorage = { open: vi.fn(async () => cache as Cache) };
  const localStorage = {
    value: null as string | null,
    getItem: vi.fn(function (this: { value: string | null }) {
      return this.value;
    }),
    setItem: vi.fn(function (this: { value: string | null }, _key: string, value: string) {
      this.value = value;
    }),
  };
  const view = {
    caches: cacheStorage,
    fetch: vi.fn(async () => new Response('image-data', { status: 200 })),
    localStorage,
    location: new URL('https://radici.example/'),
    navigator: { onLine: true },
  };
  const injector = Injector.create({
    providers: [
      { provide: DOCUMENT, useValue: { defaultView: view } },
      { provide: PLATFORM_ID, useValue: 'browser' },
    ],
  });
  const service = runInInjectionContext(injector, () => new OfflineContentService());

  return { service, entries, cache, view, localStorage };
}

describe('OfflineContentService', () => {
  it('saves a localized content snapshot and its local images', async () => {
    const { service, entries, view } = createService();
    const bundle = {
      id: 'story:fontana:it',
      type: 'story' as const,
      title: 'Fontana e memoria',
      language: 'it',
      content: { text: 'Racconto offline' },
      imagePaths: ['assets/images/fontana.svg'],
    };

    await service.save(bundle);

    expect(service.isDownloaded(bundle.id)).toBe(true);
    expect(service.packages()[0]).toMatchObject({
      id: bundle.id,
      language: 'it',
      sizeBytes: expect.any(Number),
    });
    expect(view.fetch).toHaveBeenCalledOnce();
    expect(entries.size).toBe(2);
    expect(service.error()).toBeNull();
  });

  it('retains shared images until the last package using them is removed', async () => {
    const { service, entries, cache } = createService();
    const imagePaths = ['assets/images/fontana.svg'];

    await service.save({
      id: 'story:first:it',
      type: 'story',
      title: 'Story one',
      language: 'it',
      content: { text: 'One' },
      imagePaths,
    });
    await service.save({
      id: 'story:second:it',
      type: 'story',
      title: 'Story two',
      language: 'it',
      content: { text: 'Two' },
      imagePaths,
    });
    const imageUrl = [...entries.keys()].find((key) => key.includes('/assets/images/'));

    await service.remove('story:first:it');
    expect(imageUrl).toBeDefined();
    expect(entries.has(imageUrl!)).toBe(true);

    await service.remove('story:second:it');
    expect(entries.has(imageUrl!)).toBe(false);
    expect(cache.delete).toHaveBeenCalled();
    expect(service.packages()).toEqual([]);
  });

  it('rejects images outside the local guide asset directory', async () => {
    const { service, view } = createService();

    await service.save({
      id: 'place:external:it',
      type: 'place',
      title: 'Place',
      language: 'it',
      content: { text: 'Description' },
      imagePaths: ['https://external.example/photo.jpg'],
    });

    expect(view.fetch).not.toHaveBeenCalled();
    expect(service.error()).toBe('invalid');
  });
});
