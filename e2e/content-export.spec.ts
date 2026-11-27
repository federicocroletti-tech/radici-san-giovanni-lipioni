import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

async function expectPdfDownload(
  page: import('@playwright/test').Page,
  button: import('@playwright/test').Locator,
  expectedFilename: string,
  expectedContent: string,
): Promise<void> {
  const downloadPromise = page.waitForEvent('download');
  await button.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(expectedFilename);

  const path = await download.path();
  if (!path) throw new Error('The browser did not save the exported PDF');
  const file = await readFile(path);
  expect(file.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  expect(file.byteLength).toBeGreaterThan(500);
  expect(file.toString('latin1')).toContain(expectedContent);
}

test('exports story, itinerary and map place as downloadable PDFs', async ({ page }) => {
  await page.goto('/racconti');
  await expectPdfDownload(
    page,
    page.locator('.story-card').first().getByRole('button', { name: 'Esporta PDF' }),
    'piazza-largo-popolo-ritorni.pdf',
    'Piazza Largo del Popolo e i ritorni',
  );

  await page.goto('/itinerari');
  await expectPdfDownload(
    page,
    page.locator('.itinerary-card').first().getByRole('button', { name: 'Esporta PDF' }),
    'cuore-del-borgo.pdf',
    'Centro, piazza e memoria valdese',
  );

  await page.goto('/esplora?place=centro-storico&view=map');
  await expectPdfDownload(
    page,
    page.locator('.detail-drawer').getByRole('button', { name: 'Esporta PDF' }),
    'centro-storico.pdf',
    'Centro storico',
  );
});
