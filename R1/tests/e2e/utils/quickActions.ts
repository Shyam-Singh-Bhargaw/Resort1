import type { Page, APIResponse } from '@playwright/test';

export async function createOfferAndGetId(page: Page, { title, description, discount }: { title: string; description: string; discount: string }) {
  // Open modal
  await page.getByRole('button', { name: /Create Seasonal Offer/i }).click();

  // Fill form
  await page.getByLabel('Offer title').fill(title);
  await page.getByLabel('Offer description').fill(description);
  await page.getByLabel('Discount percent').fill(discount);

  // Submit and wait for POST response to capture created id
  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/packages')),
    page.getByRole('button', { name: /Create Offer/i }).click(),
  ]);

  const created = await resp.json();
  return created as { id: string };
}

export async function clickUndoInToastAndWaitForDelete(page: Page, createdId: string) {
  // Wait for toast to appear with confirmation text
  const toast = page.locator('[role="status"]').filter({ hasText: /Offer created/i });
  await toast.waitFor({ timeout: 5000 });

  // Click enabled Undo button inside that toast (some toasts render buttons disabled for a short time)
  const undoButtons = toast.getByRole('button', { name: /Undo/i });
  let clicked = false;
  for (let attempt = 0; attempt < 25; attempt++) {
    const cnt = await undoButtons.count();
    for (let i = 0; i < cnt; i++) {
      const b = undoButtons.nth(i);
      if (!(await b.isDisabled())) {
        await b.click();
        clicked = true;
        break;
      }
    }
    if (clicked) break;
    await page.waitForTimeout(200);
  }
  if (!clicked) {
    // As a last resort, find the toast and dispatch a click on any element containing 'Undo' via page.evaluate
    const dispatched = await page.evaluate(() => {
      const statuses = Array.from(document.querySelectorAll('[role="status"]')) as HTMLElement[];
      let toastEl: HTMLElement | null = null;
      for (const s of statuses) {
        if ((s.textContent || '').includes('Offer created')) {
          toastEl = s;
          break;
        }
      }
      if (!toastEl) return false;
      const all = Array.from(toastEl.querySelectorAll('*')) as HTMLElement[];
      const undoEl = all.find((el) => /Undo/i.test(el.textContent || '')) as HTMLElement | undefined;
      if (!undoEl) return false;
      undoEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    if (dispatched) clicked = true;
  }

  if (!clicked) throw new Error('No enabled Undo button found in toast');

  // Wait for specific DELETE request for the created id
  await page.waitForRequest((r) => r.method() === 'DELETE' && r.url().includes(`/packages/${createdId}`));
}

export async function ensureToastVisible(page: Page, text: RegExp | string) {
  await expectToast(page, text);
}

async function expectToast(page: Page, text: RegExp | string) {
  const toast = page.locator('[role="status"]').filter({ hasText: text });
  await toast.waitFor({ timeout: 5000 });
}
