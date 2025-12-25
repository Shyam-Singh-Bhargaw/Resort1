import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', size: { width: 1280, height: 720 } },
  { name: 'tablet', size: { width: 768, height: 1024 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];

for (const vp of viewports) {
  test.describe(`${vp.name} - Rooms Quick Actions`, () => {
    test.beforeEach(async ({ page }) => {
      // Stateful in-memory accommodations store for this test
      let state: any[] = [];

      await page.route('**/accommodations/**', async (route) => {
        const req = route.request();
        const url = req.url();
        const method = req.method();

        if (method === 'GET') {
          const parts = url.split('/');
          const last = parts[parts.length - 1] || parts[parts.length - 2];
          // If requesting a single item by id, return the object
          if (last && last !== 'accommodations') {
            const found = state.find((s) => String(s.id) === String(last));
            console.log('[rooms-test] GET /accommodations/:id =>', last, !!found);
            if (found) {
              await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(found) });
              return;
            }
            await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Not found' }) });
            return;
          }
          console.log('[rooms-test] GET /accommodations =>', state.length, 'items');
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state) });
          return;
        }

        if (method === 'POST') {
          const body = await req.postDataJSON();
          const created = { id: `accom-${Date.now()}`, ...body };
          state.push(created);
          console.log('[rooms-test] POST /accommodations created:', created);
          await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(created) });
          return;
        }

        if (method === 'PUT') {
          const parts = url.split('/');
          const id = parts[parts.length - 1];
          const body = await req.postDataJSON();
          state = state.map((s) => (String(s.id) === String(id) ? { ...s, ...body } : s));
          console.log('[rooms-test] PUT /accommodations/', id, body);
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id, ...body }) });
          return;
        }

        if (method === 'DELETE') {
          const parts = url.split('/');
          const id = parts[parts.length - 1];
          state = state.filter((s) => String(s.id) !== String(id));
          console.log('[rooms-test] DELETE /accommodations/', id);
          await route.fulfill({ status: 204, body: '' });
          return;
        }

        // fallback
        await route.continue();
      });

      await page.setViewportSize(vp.size);
    });

    test('create -> appears in ManageAccommodations -> edit -> delete', async ({ page }) => {
      await page.goto('http://localhost:3000/admin');

      // Open Add New Room modal
      await page.getByRole('button', { name: /Add New Room/i }).click();

      // Fill modal
      await page.getByLabel('Room title').fill('Test Room');
      await page.getByLabel('Room price').fill('350');
      await page.getByRole('button', { name: /Add Room/i }).click();

      // Wait for toast confirming creation
      await page.waitForTimeout(100);
      const toast = page.locator('[role="status"]').filter({ hasText: /Room created/i });
      await expect(toast).toBeVisible({ timeout: 5000 });

      // Click Undo in toast to ensure quick action delete works
      const undoBtn = toast.getByRole('button', { name: /Undo/i });
      if (await undoBtn.count()) {
        await undoBtn.first().click();
        // Wait briefly and confirm the created room is not present in the API store
        await page.waitForTimeout(100);
        const accommodationsAfterUndo = await page.evaluate(async () => {
          const res = await fetch('http://localhost:8000/api/accommodations/');
          return res.json();
        });
        // Expect the recently created room to be absent
        expect(
          !(Array.isArray(accommodationsAfterUndo) && accommodationsAfterUndo.some((a: any) => a.name === 'Test Room' || a.title === 'Test Room'))
        ).toBeTruthy();
      }

      // Use the Manage Accommodations form on the dashboard to create a room (uses 'name')
      await page.getByLabel('Name *').fill('Test Room');
      await page.getByLabel('Description *').fill('Room for testing');
      await page.getByLabel('Price/Night ($) *').fill('350');
      // Use a direct DOM click to avoid Playwright strict mode timing issues
      await page.evaluate(() => (document.querySelector('button[title="Create new accommodation"]') as HTMLElement | null)?.click());

      // Wait for a GET response that returns the created room (robust against race conditions)
      const createdResponse = await page.waitForResponse(async (resp) => {
        try {
          if (!resp.url().includes('/accommodations') || resp.request().method() !== 'GET') return false;
          const body = await resp.json();
          return Array.isArray(body) && body.some((a: any) => a.name === 'Test Room' || a.title === 'Test Room');
        } catch (e) {
          return false;
        }
      }, { timeout: 5000 });
      const createdBody = await createdResponse.json();
      console.log('[rooms-test] Found GET response with accommodations length:', Array.isArray(createdBody) ? createdBody.length : 'non-array');

      // Try to locate the created room in the Manage Accommodations section; fallback to Rooms page if needed
      const sectionHeading = page.getByRole('heading', { name: 'Manage Accommodations' }).locator('..');
      const heading = sectionHeading.getByRole('heading', { level: 3, name: 'Test Room' });
      try {
        await expect(heading).toBeVisible({ timeout: 10000 });
      } catch (err) {
        // Fallback: navigate to Rooms page (client-side) and look for the room there
        await page.evaluate(() => (document.querySelector('a[href="/admin/rooms"]') as HTMLElement | null)?.click());
        await expect(page.getByRole('heading', { level: 3, name: 'Test Room' })).toBeVisible({ timeout: 10000 });
      }
      const sectionHeading = page.getByRole('heading', { name: 'Manage Accommodations' }).locator('..');
      const heading = sectionHeading.getByRole('heading', { level: 3, name: 'Test Room' });
      await expect(heading).toBeVisible({ timeout: 5000 });
      const card = heading.locator('..');

      // Ensure Edit button inside the card is visible, then click it
      const editBtn = card.getByRole('button', { name: /Edit/i });
      await expect(editBtn).toBeVisible({ timeout: 5000 });
      await editBtn.click();

      // The form should be populated; change the price
      await page.getByLabel('Price/Night ($) *').fill('399');
      await page.getByRole('button', { name: /Update/i }).click();

      // Confirm alert dialog (application uses alert to notify) — accept it
      page.on('dialog', async (dialog) => { await dialog.accept(); });

      // Wait for updated price to show in the card
      await expect(card.getByText(/Price: \$399\/night/i)).toBeVisible();

      // Delete the accommodation (confirm)
      page.on('dialog', async (dialog) => { await dialog.accept(); });
      await card.getByRole('button', { name: /Delete/i }).click();

      // Wait for the item to be removed
      await expect(page.locator('text=Test Room')).toHaveCount(0);
    });
  });
}
