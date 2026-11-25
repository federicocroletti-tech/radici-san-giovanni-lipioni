import { expect, test } from '@playwright/test';

test('itinerary stops update progress and remain visited after reload', async ({ page }) => {
  await page.goto('/itinerari');

  const itinerary = page.locator('.itinerary-card').first();
  await expect(itinerary).toContainText('Tappe visitate: 0 di 4');
  await expect(itinerary).toContainText('Tempi e accessibilita vanno verificati sul posto');

  await itinerary.getByRole('button', { name: 'Segna come visitato' }).first().click();
  await expect(itinerary).toContainText('Tappe visitate: 1 di 4');

  await page.reload();
  const reloadedItinerary = page.locator('.itinerary-card').first();
  await expect(reloadedItinerary).toContainText('Tappe visitate: 1 di 4');
  await reloadedItinerary.getByRole('button', { name: 'Segna come non visitato' }).first().click();
  await expect(reloadedItinerary).toContainText('Tappe visitate: 0 di 4');
});

test('itinerary warns when the browser blocks storage but keeps progress interactive', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Storage is unavailable', 'QuotaExceededError');
    };
  });
  await page.goto('/itinerari');

  const itinerary = page.locator('.itinerary-card').first();
  await itinerary.getByRole('button', { name: 'Segna come visitato' }).first().click();

  await expect(itinerary).toContainText('Tappe visitate: 1 di 4');
  await expect(page.getByRole('status')).toContainText(
    'Preferiti e visite restano temporanei: il browser non consente di salvarli.',
  );
});
