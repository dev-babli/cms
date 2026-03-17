import { test, expect } from '@playwright/test';
import { loginToCms, takeIssueScreenshot } from './cms.helpers';

test.describe('Category 5: CMS UI / Layout', () => {
  test('Top menu text spacing is correct', async ({ page }) => {
    await loginToCms(page);

    const topMenu = page.locator('[data-test="cms-top-menu-text"]');
    await expect(topMenu).toBeVisible();

    const text = (await topMenu.textContent())?.trim();
    expect(text).toBe('Insert Design Layout Review');

    await takeIssueScreenshot(page, 'cms-top-menu-spacing-resolved.png');
  });
});

