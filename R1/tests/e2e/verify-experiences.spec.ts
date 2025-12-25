import { test, expect } from '@playwright/test';

test('Experiences page renders seeded data', async ({ page }) => {
  await page.goto('http://localhost:3000/experiences');

  // Wait for the page to load and fetch data
  await page.waitForTimeout(2000);

  // Check for the experience name
  await expect(page.locator('text=Tea Plantation Tour').first()).toBeVisible();

  // Check for description
  await expect(page.locator('text=Guided tour').first()).toBeVisible();

  // Check for price
  await expect(page.locator('text=$30').first()).toBeVisible();

  // Check for duration
  await expect(page.locator('text=2 hours').first()).toBeVisible();
});
