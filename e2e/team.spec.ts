import { test, expect } from '@playwright/test';
import { loginToCms, gotoTeamModule, takeIssueScreenshot } from './cms.helpers';

test.describe('Category 3: Team Members', () => {
  test.beforeEach(async ({ page }) => {
    await loginToCms(page);
    await gotoTeamModule(page);
  });

  test('New team member can be added', async ({ page }) => {
    await page.click('[data-test="team-new-button"]');

    await page.fill('[data-test="team-name-input"]', 'E2E Tester');
    await page.fill('[data-test="team-position-input"]', 'QA Engineer');
    await page.fill('[data-test="team-qualification-input"]', 'B.Tech');
    await page.setInputFiles(
      '[data-test="team-image-input"]',
      'tests/fixtures/sample-avatar.jpg',
    );
    await page.click('[data-test="team-save-button"]');

    await expect(page.locator('[data-test="toast-success"]')).toContainText(/saved/i);
    await expect(
      page.locator('[data-test="team-list-row"]:has-text("E2E Tester")'),
    ).toBeVisible();

    await takeIssueScreenshot(page, 'team-member-add-resolved.png');
  });
});

