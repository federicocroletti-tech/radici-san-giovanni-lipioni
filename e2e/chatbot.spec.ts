import { expect, test } from '@playwright/test';

test('chatbot keeps a usable conversation area on short mobile screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 400 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Rifiuta opzionali' }).click();
  await page.locator('.chat-fab').click();

  const panel = page.locator('.chat-panel');
  const suggestionsToggle = panel.getByRole('button', { name: 'Domande suggerite' });
  await expect(panel).toBeVisible();
  await expect(suggestionsToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel.locator('.quick-prompts')).toBeHidden();

  const layout = await panel.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const log = element.querySelector('.chat-log')!.getBoundingClientRect();
    return {
      withinViewport:
        bounds.left >= 0 &&
        bounds.top >= 0 &&
        bounds.right <= window.innerWidth &&
        bounds.bottom <= window.innerHeight,
      width: bounds.width,
      logHeight: log.height,
    };
  });
  expect(layout.withinViewport).toBe(true);
  expect(layout.width).toBeGreaterThanOrEqual(370);
  expect(layout.logHeight).toBeGreaterThanOrEqual(140);

  await suggestionsToggle.click();
  await expect(suggestionsToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.locator('.quick-prompts button').first()).toBeVisible();
});

test('chatbot panel has a wider desktop layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.chat-fab').click();

  const panel = page.locator('.chat-panel');
  await expect(panel).toBeVisible();
  await expect
    .poll(() => panel.evaluate((element) => element.getBoundingClientRect().width))
    .toBeGreaterThanOrEqual(470);
});

test('translated chatbot prompts fit a narrow mobile panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Rifiuta opzionali' }).click();
  await page.locator('.language-select').selectOption('fr');
  await page.setViewportSize({ width: 320, height: 400 });
  await page.locator('.chat-fab').click();

  const panel = page.locator('.chat-panel');
  const suggestionsToggle = panel.getByRole('button', { name: 'Questions suggérées' });
  await suggestionsToggle.click();
  await expect(suggestionsToggle).toHaveAttribute('aria-expanded', 'true');

  const overflow = await panel.locator('.quick-prompts .chip').evaluateAll((buttons) =>
    buttons
      .filter(
        (button) =>
          button.scrollWidth > button.clientWidth + 1 ||
          button.scrollHeight > button.clientHeight + 1,
      )
      .map((button) => ({
        text: button.textContent?.trim(),
        clientWidth: button.clientWidth,
        scrollWidth: button.scrollWidth,
        clientHeight: button.clientHeight,
        scrollHeight: button.scrollHeight,
      })),
  );
  expect(overflow).toEqual([]);
  const headerOverlaps = await panel.evaluate((element) => {
    const title = element.querySelector('h2')!.getBoundingClientRect();
    const newChat = element.querySelector('.chat-header-actions .text-button')!.getBoundingClientRect();
    return title.right > newChat.left && title.bottom > newChat.top;
  });
  expect(headerOverlaps).toBe(false);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test('place answers show registered supporting sources and conflicting claims', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Rifiuta opzionali' }).click();
  await page.locator('.chat-fab').click();

  const panel = page.locator('.chat-panel');
  await panel
    .getByLabel('Scrivi la tua domanda')
    .fill('Parlami della Chiesa di Santa Maria delle Grazie');
  await panel.getByRole('button', { name: 'Invia' }).click();

  const citations = panel.locator('.chatbot-citations');
  await expect(citations).toBeVisible();
  await expect(
    citations.getByRole('link', {
      name: 'La Chiesa di Santa Maria delle Grazie di San Giovanni Lipioni (CH)',
    }),
  ).toHaveAttribute('href', 'https://www.altovastese.it/arte/santa-maria-delle-grazie-san-giovanni-lipioni/');
  await expect(citations).toContainText('XVI secolo');
  await expect(citations).toContainText('XVII secolo');
});
