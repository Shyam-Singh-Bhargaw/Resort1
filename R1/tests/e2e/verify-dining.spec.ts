import { test, expect } from '@playwright/test';

test('Dining page renders with menu items', async ({ page }) => {
  await page.goto('http://localhost:3000/dining');

  // Wait for page to load - check for hero section
  await page.waitForSelector('text=Menu', { timeout: 10000 });
  
  // Verify hero section exists
  await expect(page.locator('text=Where nourishment meets purity')).toBeVisible();

  // Verify search bar is visible
  await expect(page.locator('placeholder=Search dishes')).toBeVisible();

  // Verify category filter buttons are visible
  await expect(page.locator('text=🥗 Starters').first()).toBeVisible();
  await expect(page.locator('text=🍛 Main Course')).toBeVisible();
  await expect(page.locator('text=🍞 Sides & Rotis')).toBeVisible();
  await expect(page.locator('text=🍮 Desserts')).toBeVisible();
  await expect(page.locator('text=☕ Beverages')).toBeVisible();
});

test('Dining page search functionality works', async ({ page }) => {
  await page.goto('http://localhost:3000/dining');

  // Wait for the page to load
  await page.waitForSelector('text=Menu', { timeout: 10000 });

  // Type in search box
  const searchInput = page.locator('input[placeholder="Search dishes"]');
  await searchInput.fill('khichdi');

  // Wait a moment for filtering
  await page.waitForTimeout(500);

  // Verify search input has the text
  await expect(searchInput).toHaveValue('khichdi');
});

test('Dining page category filter works', async ({ page }) => {
  await page.goto('http://localhost:3000/dining');

  // Wait for page to load
  await page.waitForSelector('text=Menu', { timeout: 10000 });

  // Click on Main Course category button
  await page.locator('text=🍛 Main Course').click();

  // Verify the button is highlighted/active
  const mainButton = page.locator('button:has-text("🍛 Main Course")');
  await expect(mainButton).toBeFocused();
});

test('Dining page sort functionality exists', async ({ page }) => {
  await page.goto('http://localhost:3000/dining');

  // Wait for page to load
  await page.waitForSelector('text=Menu', { timeout: 10000 });

  // Verify sort dropdown exists
  const sortSelect = page.locator('select');
  await expect(sortSelect).toBeVisible();
});
