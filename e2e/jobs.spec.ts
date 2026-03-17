import { test, expect } from '@playwright/test';
import { loginToCms, gotoJobModule, takeIssueScreenshot } from './cms.helpers';

test.describe('Category 2: Job Postings CMS', () => {
  test.beforeEach(async ({ page }) => {
    await loginToCms(page);
    await gotoJobModule(page);
  });

  test('Bullet points format correctly', async ({ page }) => {
    await page.click('[data-test="jobs-new-button"]');
    const editor = page.locator('[data-test="jobs-editor"]');

    await page.click('[data-test="jobs-editor-bullet-list-button"]');
    await editor.type('Bullet point');
    await expect(page.locator('[data-test="jobs-editor-list-item"]').first()).toHaveText(
      /Bullet point/,
    );

    await takeIssueScreenshot(page, 'jobs-bullets-same-line-resolved.png');
  });

  test('Text can be made bold', async ({ page }) => {
    await page.click('[data-test="jobs-new-button"]');
    const editor = page.locator('[data-test="jobs-editor"]');

    await editor.type('Bold text');
    await editor.selectText();
    await page.click('[data-test="jobs-editor-bold-button"]');

    await expect(page.locator('[data-test="jobs-editor-bold-node"]').first()).toHaveText(
      /Bold text/,
    );

    await takeIssueScreenshot(page, 'jobs-bold-formatting-resolved.png');
  });

  test('Text alignment inside job posting editor', async ({ page }) => {
    await page.click('[data-test="jobs-new-button"]');
    const editor = page.locator('[data-test="jobs-editor"]');

    await editor.fill('Align me job');
    await page.click('[data-test="jobs-editor-align-center"]');
    await expect(editor).toHaveAttribute('data-align', /center/);

    await takeIssueScreenshot(page, 'jobs-text-alignment-resolved.png');
  });

  test('Preview functionality works', async ({ page }) => {
    await page.click('[data-test="jobs-new-button"]');
    await page.fill('[data-test="jobs-title-input"]', 'Job E2E');
    await page.fill('[data-test="jobs-editor"]', 'Job description');

    await page.click('[data-test="jobs-preview-button"]');
    await page.waitForSelector('[data-test="jobs-preview-modal"]');
    await expect(page.locator('[data-test="jobs-preview-title"]')).toContainText('Job E2E');

    await takeIssueScreenshot(page, 'jobs-preview-resolved.png');
  });

  test('Formatting persists after publishing', async ({ page, context }) => {
    await page.click('[data-test="jobs-new-button"]');
    await page.fill('[data-test="jobs-title-input"]', 'Job Formatting E2E');
    const editor = page.locator('[data-test="jobs-editor"]');

    await editor.fill('Formatted job');
    await editor.selectText();
    await page.click('[data-test="jobs-editor-heading-h2"]');
    await page.click('[data-test="jobs-editor-color-picker"]');
    await page.click('[data-test="jobs-editor-color-option-primary"]');

    await page.click('[data-test="jobs-publish-button"]');
    await expect(page.locator('[data-test="toast-success"]')).toContainText(/published/i);

    const jobPublicUrl = await page.getAttribute(
      '[data-test="jobs-last-published-link"]',
      'href',
    );
    if (jobPublicUrl) {
      const frontend = await context.newPage();
      await frontend.goto(jobPublicUrl);
      await expect(frontend.locator('h2:has-text("Formatted job")')).toBeVisible();
      await takeIssueScreenshot(
        frontend,
        'jobs-formatting-persist-frontend-resolved.png',
      );
      await frontend.close();
    } else {
      await takeIssueScreenshot(page, 'jobs-formatting-persist-backoffice-resolved.png');
    }
  });
});

