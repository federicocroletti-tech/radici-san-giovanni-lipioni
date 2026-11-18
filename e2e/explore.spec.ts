import { expect, test } from '@playwright/test';

test('expanded cookie preferences remain usable on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/esplora');
  const banner = page.locator('.cookie-banner');
  await banner.getByRole('button', { name: 'Gestisci preferenze cookie' }).click();
  await expect
    .poll(() =>
      banner.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top >= 0 && bounds.bottom <= window.innerHeight;
      }),
    )
    .toBe(true);
  await banner.getByRole('button', { name: 'Rifiuta opzionali' }).click();
  await expect(banner).toBeHidden();
});

test('explore controls stay within their panel without overlaps at every breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/esplora?place=chiesa-santa-maria&view=list');
  await expect(page.locator('.quick-place-list button').first()).toBeVisible();

  for (const language of ['it', 'en', 'fr']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const languageSelect = page.locator('.language-select');
    if ((await languageSelect.inputValue()) !== language) {
      await languageSelect.selectOption(language);
    }
    await expect(page.locator('html')).toHaveAttribute('lang', language);

    for (const width of [1440, 1280, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(
          () =>
            page.locator('.filters-panel').evaluate((panel) => {
              const bounds = panel.getBoundingClientRect();
              const controls = [...panel.querySelectorAll('input, select, button')].map((element) => ({
                name: element.textContent?.trim().slice(0, 45) || element.tagName,
                rect: element.getBoundingClientRect(),
              }));
              const violations: string[] = [];
              if (document.documentElement.scrollWidth > window.innerWidth + 1) {
                violations.push('Page overflows horizontally');
              }
              for (const [index, control] of controls.entries()) {
                if (control.rect.width === 0) continue;
                if (control.rect.left < bounds.left - 1 || control.rect.right > bounds.right + 1) {
                  violations.push(`${control.name} extends outside the filter panel`);
                }
                for (const other of controls.slice(index + 1)) {
                  const overlapX =
                    Math.min(control.rect.right, other.rect.right) -
                    Math.max(control.rect.left, other.rect.left);
                  const overlapY =
                    Math.min(control.rect.bottom, other.rect.bottom) -
                    Math.max(control.rect.top, other.rect.top);
                  if (overlapX > 1 && overlapY > 1) {
                    violations.push(`${control.name} overlaps ${other.name}`);
                  }
                }
              }
              return violations;
            }),
          { message: `Filter layout at ${width}px in ${language}` },
        )
        .toEqual([]);
    }
  }
});

test('mobile explore filters, deep links, and remembers favorites', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/esplora');

  const logo = page.locator('.brand img');
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  const search = page.getByLabel('Cerca luoghi o tag');
  await search.fill('Santa Maria delle Grazie');
  await expect
    .poll(() => new URL(page.url()).searchParams.get('q'))
    .toBe('Santa Maria delle Grazie');
  await expect(page.locator('.quick-place-list button')).toHaveCount(1);

  await page.getByRole('tab', { name: /Mappa/ }).click();
  await expect(page.locator('#explore-map-panel')).toBeVisible();
  await page.getByRole('tab', { name: /Lista/ }).click();
  await page.locator('.quick-place-list button').first().click();

  await expect(page).toHaveURL(/place=chiesa-santa-maria/);
  await expect(page.getByRole('heading', { name: 'Chiesa di Santa Maria delle Grazie' })).toBeVisible();
  await page.getByRole('button', { name: 'Salva tra i preferiti' }).click();
  await expect(page.getByRole('button', { name: 'Rimuovi dai preferiti' })).toBeVisible();
  await page.getByRole('button', { name: 'Segna come visitato' }).click();
  await expect(page.getByRole('button', { name: 'Segna come non visitato' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Indicazioni stradali' })).toHaveAttribute(
    'href',
    /google\.com\/maps\/dir/,
  );
  await page.getByRole('button', { name: 'Condividi luogo' }).click();
  await expect(page.getByRole('status')).toContainText('Link copiato.');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(
    '/esplora?place=chiesa-santa-maria&view=map',
  );

  await page.reload();
  await page.getByRole('tab', { name: /Lista/ }).click();
  await page.getByRole('button', { name: /Preferiti/ }).click();
  await expect(page.locator('.quick-place-list button')).toHaveCount(1);
  await expect(page.locator('.quick-place-list button').first()).toContainText('Chiesa');
  await page.getByRole('button', { name: /Visitati/ }).click();
  await expect(page.locator('.quick-place-list button')).toHaveCount(1);
});

test('location is requested only after the visitor action', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 41.8449, longitude: 14.5621 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/esplora');

  await page.getByRole('button', { name: 'Mostra la mia posizione' }).click();
  await expect(page.getByRole('status')).toContainText('Posizione rilevata solo per questa sessione.');
  await expect(page.getByRole('tab', { name: /Mappa/ })).toHaveAttribute('aria-selected', 'true');
});

test('cached guide content remains available offline', async ({ page, context }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/esplora');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const names = await caches.keys();
          const appCache = names.find((name) => name.includes(':assets:app:cache'));
          const dataCache = names.find((name) => name.includes(':assets:static-content:cache'));
          if (!appCache || !dataCache) return false;
          const appUrls = (await (await caches.open(appCache)).keys()).map((request) => request.url);
          const dataUrls = (await (await caches.open(dataCache)).keys()).map((request) => request.url);
          return (
            appUrls.some((url) => url.endsWith('/index.html')) &&
            appUrls.some((url) => /\/main-[^/]+\.js$/.test(url)) &&
            appUrls.some((url) => /\/styles-[^/]+\.css$/.test(url)) &&
            dataUrls.some((url) => url.endsWith('/assets/data/places.json')) &&
            dataUrls.some((url) => url.endsWith('/assets/i18n/it.json'))
          );
        }),
      { timeout: 45_000 },
    )
    .toBe(true);
  await expect(page.locator('.quick-place-list button').first()).toBeVisible();

  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send('Network.clearBrowserCache');
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Esplora la mappa di San Giovanni Lipioni' })).toBeVisible();
  await expect(page.locator('.quick-place-list button').first()).toBeVisible();
});
