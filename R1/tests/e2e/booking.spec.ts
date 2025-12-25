import { test, expect } from '@playwright/test';

test('admin can create booking via modal and undo', async ({ page }) => {
  await page.goto('http://localhost:3000/admin');

  // open quick actions and click Create New Booking
  await page.getByRole('button', { name: /Create New Booking/i }).click();

  // fill guest name
  const guest = 'Test Guest';
  await page.getByLabel('Guest name').fill(guest);

  // select room (first option)
  const roomSelect = page.getByLabel('Select room');
  await expect(roomSelect).toBeVisible();
  const val = await roomSelect.locator('option').first().getAttribute('value');
  if (val) await roomSelect.selectOption(val);

  // choose check-in date today
  const today = new Date().toISOString().slice(0,10);
  await page.getByLabel('Check-in date').fill(today);

  // submit
  await page.getByRole('button', { name: /Create Booking/i }).click();

  // expect toast to show booking created
  await expect(page.getByText(/Booking .* created/i)).toBeVisible({ timeout: 5000 });

  // click Undo in toast
  await page.getByRole('button', { name: /Undo/i }).click();

  // expect toast removed
  await expect(page.locator('text=Booking')).toHaveCount(0);
});

// User flow: open Rooms, select room, create booking
test('select room and create booking', async ({ page, request }) => {
  const BASE = process.env.BASE_URL || 'http://localhost:3000';

  // Ensure backend has cottages with rooms
  const res = await request.get(`${BASE}/api/cottages`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(Array.isArray(data.items)).toBeTruthy();
  const item = data.items.find((it: any) => Array.isArray(it.rooms) && it.rooms.length > 0);
  expect(item).toBeDefined();

  const accName = item.name;
  const roomId = item.rooms[0].id;

  // Open Rooms page
  await page.goto(`${BASE}/rooms`);
  // wait for accommodation heading to appear (may take a moment)
  await page.getByRole('heading', { name: accName }).waitFor({ state: 'visible', timeout: 10000 });

  // Open the cottage detail for the chosen accommodation
  const heading = page.getByRole('heading', { name: accName });
  const card = heading.locator('..');
  await card.getByRole('button', { name: 'View Details' }).click();

  // Select first room radio
  const roomLabel = `Select room ${item.rooms[0].name}`;
  await page.getByLabel(roomLabel).check();

  // Click Book This Cottage (navigates to booking page with room query)
  await Promise.all([
    page.waitForURL('**/booking**'),
    page.getByRole('button', { name: /Book This Cottage/i }).click(),
  ]);

  // Fill dates: tomorrow and day after
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  await page.locator('input[type="date"]').first().fill(fmt(tomorrow));
  await page.locator('input[type="date"]').nth(1).fill(fmt(dayAfter));

  // Proceed to next (guests select appears pre-filled by room selection)
  await page.getByRole('button', { name: 'Next' }).click();

  // Fill guest info
  await page.fill('#first-name', 'E2E');
  await page.fill('#last-name', 'Tester');
  await page.fill('#email', 'e2e.test@example.com');
  await page.fill('#phone', '1234567890');

  // Next to payment
  await page.getByRole('button', { name: 'Next' }).click();

  // Confirm & Pay and wait for booking POST
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().endsWith('/api/bookings') && resp.request().method() === 'POST'),
    page.getByRole('button', { name: /Confirm & Pay/i }).click(),
  ]);

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body).toHaveProperty('id');
  expect(Array.isArray(body.allocated_cottages)).toBeTruthy();
  expect(body.allocated_cottages.length).toBeGreaterThan(0);

  // Booking created - fetch the booking to assert allocation present
  const bookingRes = await request.get(`http://localhost:3000/bookings/${body.id}`);
  // if compatibility routes, booking path might be /api/bookings - try fallback
  if (bookingRes.ok()) {
    const b = await bookingRes.json();
    expect(b).toHaveProperty('allocated_cottages');
  }
});