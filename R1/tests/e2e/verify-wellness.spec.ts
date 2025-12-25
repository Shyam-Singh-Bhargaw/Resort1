import { test, expect } from '@playwright/test';

test('Wellness page renders seeded data', async ({ page }) => {
  await page.goto('http://localhost:3000/wellness');

  // Wait for and verify the wellness program (Ayurvedic Massage) is visible
  await page.waitForSelector('text=Ayurvedic Massage', { timeout: 10000 });
  
  // Use first() to avoid strict mode violation with multiple matches (featured + card)
  await expect(page.locator('text=Ayurvedic Massage').first()).toBeVisible();

  // Verify description is visible (also use first to avoid strict mode)
  await expect(page.locator('text=Traditional massage').first()).toBeVisible();
});
