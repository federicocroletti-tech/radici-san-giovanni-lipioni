import { expect, test } from '@playwright/test';

test('downloaded place content and images remain available offline', async ({ page, context }) => {
  test.setTimeout(60_000);
  await page.goto('/racconti');
  const story = page.locator('.story-card').first();
  await story.getByRole('button', { name: 'Scarica per offline' }).click();
  await expect(story.getByRole('button', { name: 'Rimuovi download offline' })).toBeVisible();
  await expect(story.getByRole('status')).toContainText('Disponibile offline');
  await story.getByRole('button', { name: 'Rimuovi download offline' }).click();
  await expect(story.getByRole('button', { name: 'Scarica per offline' })).toBeVisible();

  await page.goto('/itinerari');
  const itinerary = page.locator('.itinerary-card').first();
  await itinerary.getByRole('button', { name: 'Scarica per offline' }).click();
  await expect(itinerary.getByRole('button', { name: 'Rimuovi download offline' })).toBeVisible();
  await expect(itinerary.getByRole('status')).toContainText('Disponibile offline');

  await page.goto('/esplora?place=centro-storico&view=map');

  const downloadButton = page.getByRole('button', { name: 'Scarica per offline' });
  await expect(downloadButton).toBeVisible();
  await downloadButton.click();
  await expect(page.getByRole('button', { name: 'Rimuovi download offline' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Disponibile offline');
  await page.getByRole('button', { name: 'Aggiorna download offline' }).click();
  await expect(page.getByRole('button', { name: 'Rimuovi download offline' })).toBeVisible();

  const packageDetails = await page.evaluate(async () => {
    const cache = await caches.open('radici-offline-content-v1');
    const requests = await cache.keys();
    const packageRequest = requests.find((request) =>
      request.url.includes('__offline-content__/place%3Acentro-storico%3Ait.json'),
    );
    if (!packageRequest) return null;

    const response = await cache.match(packageRequest);
    const bundle = (await response?.json()) as
      | { content?: { id?: string }; imageUrls?: string[] }
      | undefined;
    return { placeId: bundle?.content?.id, imageCount: bundle?.imageUrls?.length ?? 0 };
  });
  expect(packageDetails).toEqual({ placeId: 'centro-storico', imageCount: 1 });

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send('Network.clearBrowserCache');
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Centro storico' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rimuovi download offline' })).toBeVisible();
  await expect
    .poll(() =>
      page.locator('.detail-drawer img').evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
});
