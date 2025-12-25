import { test, expect } from '@playwright/test';

test('Rooms render seeded items', async ({ page }) => {
  await page.goto('http://localhost:3000/rooms');

  // Wait for the rooms to load and verify seeded names are visible
  await page.waitForSelector('text=Garden Suite', { timeout: 10000 });
  await expect(page.locator('text=Garden Suite')).toBeVisible();

  await page.waitForSelector('text=Mountain Villa', { timeout: 10000 });
  await expect(page.locator('text=Mountain Villa')).toBeVisible();
});
