import { expect, test } from '@playwright/test';

test('colombia page renders the Venezuela campaign with COP donations', async ({ page }) => {
  await page.goto('/colombia/#donar');

  await expect(page).toHaveTitle(/Súmate VZLA Colombia/);
  await expect(page.getByText('Colombia presente')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Venezuela se levanta');
  await expect(page.locator('#summary-amount')).toHaveText('COP $100.000');
  await expect(page.getByRole('button', { name: /donar COP \$100\.000 ahora/i })).toBeVisible();
  await expect(page.locator('#conv-note')).toHaveText('');
});

test('colombia Wompi payment shows backend errors without leaving the page', async ({ page }) => {
  await page.route('https://koxrtxplpybdfymgdhhd.supabase.co/functions/v1/crear-donacion-wompi-colombia', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Pagos Wompi no configurados.' }),
    });
  });

  await page.goto('/colombia/#donar');
  await page.locator('#d-email').fill('donante@example.com');
  await page.getByRole('button', { name: /donar COP \$100\.000 ahora/i }).click();

  await expect(page.locator('#form-error')).toContainText('Pagos Wompi no configurados.');
  await expect(page).toHaveURL(/\/colombia\/#donar$/);
});

test('colombia thank-you page verifies Wompi transaction', async ({ page }) => {
  await page.route('https://koxrtxplpybdfymgdhhd.supabase.co/functions/v1/crear-donacion-wompi-colombia?id=TX-123', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ paid: true, status: 'APPROVED' }),
    });
  });

  await page.goto('/colombia/gracias.html?id=TX-123');

  await expect(page).toHaveTitle(/Súmate VZLA Colombia/);
  await expect(page.getByRole('heading', { name: /gracias por tu corazón/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', 'index.html');
});
