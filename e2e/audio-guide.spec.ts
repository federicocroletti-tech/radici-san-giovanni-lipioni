import { expect, test } from '@playwright/test';

test('story, itinerary and map cards expose localized audio controls', async ({ page }) => {
  await page.addInitScript(() => {
    class MockSpeechSynthesisUtterance {
      lang = '';
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(readonly text: string) {}
    }

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockSpeechSynthesisUtterance,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: (utterance: MockSpeechSynthesisUtterance) => {
          (window as Window & { lastSpokenText?: string; lastSpokenLanguage?: string }).lastSpokenText =
            utterance.text;
          (window as Window & { lastSpokenText?: string; lastSpokenLanguage?: string }).lastSpokenLanguage =
            utterance.lang;
        },
        cancel: () => undefined,
      },
    });
  });

  await page.goto('/racconti');
  const story = page.locator('.story-card').first();
  const storyAudio = story.getByRole('button', { name: 'Ascolta' });
  await expect(storyAudio).toBeVisible();
  await expect(storyAudio).toHaveAttribute('aria-pressed', 'false');
  await storyAudio.click();
  await expect(page.getByRole('button', { name: 'Interrompi audio' }).first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect
    .poll(() => page.evaluate(() => (window as Window & { lastSpokenLanguage?: string }).lastSpokenLanguage))
    .toBe('it-IT');
  await page.getByRole('button', { name: 'Interrompi audio' }).first().click();
  await expect(storyAudio).toHaveAttribute('aria-pressed', 'false');

  await page.goto('/itinerari');
  const itineraryAudio = page.locator('.itinerary-card').first().locator('.actions-row button').first();
  await expect(itineraryAudio).toBeVisible();
  await expect(itineraryAudio).toHaveAttribute('aria-pressed', 'false');
  await itineraryAudio.click();
  await expect(page.getByRole('button', { name: 'Interrompi audio' }).first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.goto('/esplora?place=centro-storico&view=map');
  const mapAudio = page.getByRole('button', { name: 'Ascolta audio-guida' });
  await expect(mapAudio).toBeVisible();
  await expect(mapAudio).toHaveAttribute('aria-pressed', 'false');
  await mapAudio.click();
  await expect(page.getByRole('button', { name: 'Interrompi audio' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.locator('.language-select').selectOption('fr');
  await expect(page.getByRole('button', { name: 'Arrêter l’audio' })).toBeVisible();
});
