import { expect, test } from '@playwright/test';

const viewports = [
  { width: 1440, height: 1000 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 740 },
  { width: 320, height: 568 },
];

for (const viewport of viewports) {
  test(`page has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('mobile prioritizes the donation form at the top of the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const donationSection = await page.locator('#donar').boundingBox();
  const heroSection = await page.locator('.hero').boundingBox();
  const donationForm = await page.locator('#donate-form').boundingBox();

  expect(donationSection).not.toBeNull();
  expect(heroSection).not.toBeNull();
  expect(donationForm).not.toBeNull();
  expect(donationSection.y).toBeLessThan(heroSection.y);
  expect(donationForm.y).toBeLessThan(320);
});
