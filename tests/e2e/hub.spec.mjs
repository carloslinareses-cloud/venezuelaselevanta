import { expect, test } from '@playwright/test';

/**
 * El hub (portada) es el directorio de campañas: debe listarlas y llevar a cada una.
 */

test('la portada muestra las campañas activas', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toContainText(/Elige a quién quieres ayudar/i);

  const tarjetas = page.locator('.camp-card');
  await expect(tarjetas).toHaveCount(2);

  // Campaña humanitaria (la que ya existía)
  const terremoto = page.locator('[data-campana="terremoto"]');
  await expect(terremoto).toBeVisible();
  await expect(terremoto.locator('.camp-cta')).toHaveAttribute('href', 'terremoto/');

  // Campaña de la Torre B (Ayuda Robles)
  const robles = page.locator('[data-campana="torre-b-robles"]');
  await expect(robles).toBeVisible();
  await expect(robles.locator('.camp-cta')).toHaveAttribute('href', /ayuda-robles\.pages\.dev/);
});

test('cada campaña muestra su meta o lo recaudado', async ({ page }) => {
  await page.goto('/');
  const cifras = page.locator('.camp-card .camp-cifras');
  await expect(cifras).toHaveCount(2);
  for (const texto of await cifras.allTextContents()) {
    expect(texto.trim()).not.toBe('');
    expect(texto).not.toContain('Cargando');
  }
});

test('desde la portada se llega a la campaña humanitaria', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-campana="terremoto"] .camp-cta').click();
  await expect(page).toHaveURL(/\/terremoto\//);
  await expect(page.locator('#donar')).toBeVisible();
});

test('la portada ofrece la vía en pesos para Colombia', async ({ page }) => {
  await page.goto('/');
  const extra = page.locator('[data-campana="terremoto"] .camp-extra a');
  await expect(extra).toHaveAttribute('href', 'colombia/');
});
