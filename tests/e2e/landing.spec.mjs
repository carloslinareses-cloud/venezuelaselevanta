import { expect, test } from '@playwright/test';

test('renders the landing page without encoding artifacts or runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle(/Venezuela se Levanta/);
  await expect(page.getByRole('heading', { name: /la solidaridad se levantó/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /donar ahora/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /datos, fuentes y controles/i })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/Ã|Â|ðŸ|�/);
  expect(errors).toEqual([]);
});

test('donation widget validates input and shows fallback for unconfigured USD payments', async ({ page }) => {
  await page.goto('/#donar');

  await expect(page.locator('#summary-amount')).toHaveText('€50');
  await page.locator('#custom-amount').fill('4');
  await page.getByRole('button', { name: /donar €4 ahora/i }).click();
  await expect(page.locator('#form-error')).toContainText('El monto mínimo es €5.');

  await page.locator('#custom-amount').fill('10');
  await page.locator('#d-email').fill('correo-invalido');
  await page.getByRole('button', { name: /donar €10 ahora/i }).click();
  await expect(page.locator('#form-error')).toContainText('Revisa tu correo');

  await page.locator('#d-email').fill('donante@example.com');
  await page.getByRole('button', { name: 'USD $' }).click();
  await expect(page.locator('#summary-amount')).toHaveText('$50');
  await page.getByRole('button', { name: /donar \$50 ahora/i }).click();
  await expect(page.getByRole('dialog', { name: /gracias/i })).toBeVisible();
  await expect(page.locator('#modal-resumen')).toContainText('$50');
});

test('EUR payment shows backend errors without leaving the page', async ({ page }) => {
  await page.route('https://koxrtxplpybdfymgdhhd.supabase.co/functions/v1/crear-donacion-sumup', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Pagos temporalmente no disponibles.' }),
    });
  });

  await page.goto('/#donar');
  await page.locator('#d-email').fill('donante@example.com');
  await page.getByRole('button', { name: /donar €50 ahora/i }).click();

  await expect(page.locator('#form-error')).toContainText('Pagos temporalmente no disponibles.');
  await expect(page).toHaveURL(/\/#donar$/);
});

test('mobile navigation opens, closes and keeps layout within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByRole('button', { name: /abrir menú/i }).click();
  await expect(page.locator('#site-nav')).toHaveClass(/open/);
  await page.locator('#site-nav').getByRole('link', { name: 'Fuentes' }).click();
  await expect(page.locator('#site-nav')).not.toHaveClass(/open/);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('thank-you page renders correctly', async ({ page }) => {
  await page.goto('/gracias.html');

  await expect(page).toHaveTitle(/Gracias/);
  await expect(page.getByRole('heading', { name: /gracias por tu corazón/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', 'index.html');
});
