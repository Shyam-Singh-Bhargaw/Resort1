import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', size: { width: 1280, height: 720 } },
  { name: 'tablet', size: { width: 768, height: 1024 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];

for (const vp of viewports) {
  test.describe(`${vp.name} - Wellness Quick Actions`, () => {
    test.beforeEach(async ({ page }) => {
      let state: any[] = [];

      await page.route('**/experiences/**', async (route) => {
        const req = route.request();
        const method = req.method();
        const url = req.url();

        if (method === 'GET') {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state) });
          return;
        }

        if (method === 'POST') {
          const body = await req.postDataJSON();
          const created = { id: `exp-${Date.now()}`, ...body };
          state.push(created);
          await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(created) });
          return;
        }

        if (method === 'PUT') {
          const parts = url.split('/');
          const id = parts[parts.length - 1];
          const body = await req.postDataJSON();
          state = state.map((s) => (String(s.id) === String(id) ? { ...s, ...body } : s));
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id, ...body }) });
          return;
        }

        if (method === 'DELETE') {
          const parts = url.split('/');
          const id = parts[parts.length - 1];
          state = state.filter((s) => String(s.id) !== String(id));
          await route.fulfill({ status: 204, body: '' });
          return;
        }

        await route.continue();
      });

      await page.setViewportSize(vp.size);
    });

    test('create -> visible in ManageExperiences -> edit -> delete', async ({ page }) => {
      await page.goto('http://localhost:3000/admin');

      // Open Add Wellness Program modal
      await page.getByRole('button', { name: /Add Wellness Program/i }).click();

      await page.getByLabel('Program name').fill('Test Massage');
      await page.getByLabel('Duration').fill('60m');
      // Scope price input to the modal form to avoid collisions with other 'Price' fields on the page
      // Wait for modal to be visible
      await expect(page.getByText('Add Wellness Program')).toBeVisible({ timeout: 5000 });
      const modalForm = page.getByText('Add Wellness Program').locator('..');
      await modalForm.getByLabel('Price').fill('120');
      await modalForm.getByRole('button', { name: /Add Program/i }).click();

      await page.waitForRequest((r) => r.url().includes('/experiences/') && r.method() === 'GET');

      // Toast visible (use role=status to find toast message)
      const toast = page.locator('[role="status"]').filter({ hasText: /Wellness program created/i });
      await expect(toast).toBeVisible({ timeout: 5000 });

      // It should appear in the ManageExperiences list (scope to section)
      const section = page.getByText('Manage Experiences').locator('..');
      const card = section.locator('div:has-text("Test Massage")');
      await expect(card).toBeVisible({ timeout: 5000 });

      // Click Edit on the card (use scoped selector)
      await card.getByRole('button', { name: /Edit/i }).click();

      // Change the description and submit (form is at the top of the ManageExperiences section)
      await page.getByLabel('Description').fill('Updated description for test');
      // Handle alert notify
      page.on('dialog', async (dialog) => { await dialog.accept(); });
      await page.getByRole('button', { name: /Create Experience|Create/ }).click();

      // Verify the updated description is visible
      await expect(card.getByText(/Updated description for test/i)).toBeVisible();
      // Delete the experience
      page.on('dialog', async (dialog) => { await dialog.accept(); });
      await page.getByRole('button', { name: /Delete Test Massage/i }).click();

      await expect(page.locator('text=Test Massage')).toHaveCount(0);
    });
  });
}
