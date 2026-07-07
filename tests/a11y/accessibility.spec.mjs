import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/colombia/']) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    expect(serious).toEqual([]);
  });
}
