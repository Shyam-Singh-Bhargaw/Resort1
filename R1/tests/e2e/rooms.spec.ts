import { test, expect } from '@playwright/test';

test('Rooms page: filtering, image fallback, and price formatting', async ({ page }) => {
  // Stub accommodations API response to deterministic data
  await page.route('**/accommodations/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'suite-1',
          name: 'Sky Suite',
          category: 'suite',
          description: 'An elevated suite with panoramic views',
          price_per_night: 1200,
          capacity: 4,
          size: 70,
          view: 'Valley View',
          amenities: ['wifi', 'mini-bar'],
          images: []
        },
        {
          id: 'deluxe-1',
          name: 'Deluxe Room',
          category: 'deluxe',
          description: 'Comfortable deluxe accommodation',
          price_per_night: 500,
          capacity: 2,
          size: 35,
          view: 'Garden View',
          amenities: ['wifi'],
          images: ['https://example.com/deluxe.jpg']
        }
      ])
    });
  });

  await page.goto('http://localhost:3000/rooms');

  // Wait for the grid to render
  await page.waitForSelector('.grid');

  // Filter to Suites
  await page.getByRole('button', { name: /Suites/i }).click();

  // Expect exactly one visible room card (the stubbed suite)
  const cards = page.locator('.grid >> a.group');
  await expect(cards).toHaveCount(1);

  // The category label should indicate 'suite' (the first small <p> inside the card)
  await expect(cards.locator('p').first()).toHaveText(/suite/i);

  // Image should fall back to the bundled 'luxury-suite' asset (fallback)
  const img = cards.locator('img').first();
  await expect(img).toHaveAttribute('src', /luxury-suite/);

  // Price should be formatted as currency with no decimals (e.g. $1,200)
  const price = cards.locator('span', { hasText: /\$/ }).first();
  await expect(price).toHaveText(/\$1,200/);
});