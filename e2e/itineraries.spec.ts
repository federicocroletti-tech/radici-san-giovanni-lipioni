import { expect, test } from '@playwright/test';

test('itinerary stops update progress and remain visited after reload', async ({ page }) => {
  await page.goto('/itinerari');

  const itinerary = page.locator('.itinerary-card').first();
  await expect(itinerary).toContainText('Tappe visitate: 0 di 4');
  await expect(itinerary).toContainText('Tempi e accessibilita vanno verificati sul posto');

  const firstStop = itinerary.locator('.itinerary-stops li').first();
  const firstStopName = (await firstStop.locator('span').innerText()).trim();
  const markVisited = firstStop.getByRole('button', {
    name: `Segna come visitato: ${firstStopName}`,
  });
  await expect(markVisited).toBeVisible();
  await markVisited.click();
  await expect(itinerary).toContainText('Tappe visitate: 1 di 4');

  await page.reload();
  const reloadedItinerary = page.locator('.itinerary-card').first();
  await expect(reloadedItinerary).toContainText('Tappe visitate: 1 di 4');
  const unmarkVisited = reloadedItinerary
    .locator('.itinerary-stops li')
    .first()
    .getByRole('button', { name: `Segna come non visitato: ${firstStopName}` });
  await unmarkVisited.click();
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
  await itinerary
    .locator('.itinerary-stops li')
    .first()
    .getByRole('button', { name: /^Segna come visitato: / })
    .click();

  await expect(itinerary).toContainText('Tappe visitate: 1 di 4');
  await expect(page.getByRole('status')).toContainText(
    'Preferiti e visite restano temporanei: il browser non consente di salvarli.',
  );
});
