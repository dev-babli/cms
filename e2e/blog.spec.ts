import { test, expect } from '@playwright/test';
import { loginToCms, gotoBlogModule, takeIssueScreenshot } from './cms.helpers';

test.describe('Category 1: Blog CMS & Editor', () => {
  test.beforeEach(async ({ page }) => {
    await loginToCms(page);
    await gotoBlogModule(page);
  });

  test('Featured image upload works', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');
    await page.setInputFiles(
      '[data-test="blog-featured-image-input"]',
      'tests/fixtures/sample-featured.jpg',
    );
    await expect(page.locator('[data-test="blog-featured-image-preview"]')).toBeVisible();

    await takeIssueScreenshot(page, 'blog-featured-image-resolved.png');
  });

  test('Banner and internal images upload with dimensions visible', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');

    await page.setInputFiles(
      '[data-test="blog-banner-image-input"]',
      'tests/fixtures/sample-banner.jpg',
    );
    await expect(page.locator('[data-test="blog-banner-image-dimensions"]')).toContainText('px');

    await page.click('[data-test="editor-insert-image-button"]');
    await page.setInputFiles(
      '[data-test="editor-image-upload-input"]',
      'tests/fixtures/sample-inline.jpg',
    );
    await expect(page.locator('[data-test="editor-image-node"]').first()).toBeVisible();
    await expect(page.locator('[data-test="editor-image-dimensions"]').first()).toContainText('px');

    await takeIssueScreenshot(page, 'blog-banner-internal-images-dimensions-resolved.png');
  });

  test('Heading levels H2–H6 update style in preview', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');
    await page.fill('[data-test="editor-content-area"]', 'Sample Heading');

    const preview = page.locator('[data-test="blog-preview-pane"]');
    const headingDropdown = page.locator('[data-test="editor-heading-dropdown"]');

    const levels = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;
    for (const level of levels) {
      await headingDropdown.click();
      await page.click(`[data-test="editor-heading-option-${level}"]`);
      const heading = preview.locator(level).filter({ hasText: 'Sample Heading' });
      await expect(heading).toBeVisible();
    }

    await takeIssueScreenshot(page, 'blog-heading-levels-style-resolved.png');
  });

  test('Bulleted and numbered lists keep text on same line', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');
    const editor = page.locator('[data-test="editor-content-area"]');

    await page.click('[data-test="editor-bullet-list-button"]');
    await editor.type('First bullet');
    await expect(page.locator('[data-test="editor-list-item"]').first()).toHaveText(/First bullet/);

    await page.click('[data-test="editor-ordered-list-button"]');
    await editor.type('First numbered');
    await expect(page.locator('[data-test="editor-ordered-list-item"]').first()).toHaveText(
      /First numbered/,
    );

    await takeIssueScreenshot(page, 'blog-lists-same-line-resolved.png');
  });

  test('Font size increase/decrease reflects immediately', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');
    const editor = page.locator('[data-test="editor-content-area"]');

    await editor.fill('Resizable text');
    const fontSizeIndicator = page.locator('[data-test="editor-font-size-display"]');

    await page.click('[data-test="editor-font-size-increase"]');
    const sizeAfterIncrease = await fontSizeIndicator.textContent();

    await page.click('[data-test="editor-font-size-decrease"]');
    const sizeAfterDecrease = await fontSizeIndicator.textContent();

    expect(sizeAfterIncrease && sizeAfterDecrease).toBeTruthy();
    expect(sizeAfterIncrease).not.toEqual(sizeAfterDecrease);

    await takeIssueScreenshot(page, 'blog-font-size-change-resolved.png');
  });

  test('Text and image alignment tools work', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');
    const editor = page.locator('[data-test="editor-content-area"]');

    await editor.fill('Align me');
    await page.click('[data-test="editor-align-center"]');
    await expect(editor).toHaveAttribute('data-align', /center/);

    await page.click('[data-test="editor-align-right"]');
    await expect(editor).toHaveAttribute('data-align', /right/);

    await page.click('[data-test="editor-insert-image-button"]');
    await page.setInputFiles(
      '[data-test="editor-image-upload-input"]',
      'tests/fixtures/sample-inline.jpg',
    );
    const image = page.locator('[data-test="editor-image-node"]').first();
    await image.click();
    await page.click('[data-test="editor-image-align-left"]');

    await takeIssueScreenshot(page, 'blog-text-image-alignment-resolved.png');
  });

  test('Copying text retains toolbar options (links)', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');
    const editor = page.locator('[data-test="editor-content-area"]');

    await editor.fill('Link text');
    await editor.selectText();
    await page.click('[data-test="editor-insert-link-button"]');
    await page.fill('[data-test="editor-link-url-input"]', 'https://example.com');
    await page.click('[data-test="editor-link-apply"]');

    await editor.press('Control+C');
    await editor.press('End');
    await editor.press('Enter');
    await editor.press('Control+V');

    await editor.selectText();
    await expect(page.locator('[data-test="editor-link-toolbar"]')).toBeVisible();

    await takeIssueScreenshot(page, 'blog-copy-text-toolbar-links-resolved.png');
  });

  test('Authors, categories, tags from older posts can be reused', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');

    await page.click('[data-test="blog-author-select"]');
    await expect(page.locator('[data-test="blog-author-option-existing"]')).toBeVisible();
    await page.click('[data-test="blog-author-option-existing"]');

    await page.click('[data-test="blog-category-select"]');
    await expect(page.locator('[data-test="blog-category-option-existing"]')).toBeVisible();
    await page.click('[data-test="blog-category-option-existing"]');

    await page.click('[data-test="blog-tags-input"]');
    await page.type('[data-test="blog-tags-input"]', 'existing-tag');
    await expect(
      page.locator('[data-test="blog-tag-suggestion-existing-tag"]'),
    ).toBeVisible();
    await page.click('[data-test="blog-tag-suggestion-existing-tag"]');

    await takeIssueScreenshot(page, 'blog-authors-categories-tags-reuse-resolved.png');
  });

  test('Draft flow: save as draft and preview', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');
    await page.fill('[data-test="blog-title-input"]', 'Draft post – E2E');
    await page.fill('[data-test="editor-content-area"]', 'Draft content');

    await page.click('[data-test="blog-save-draft-button"]');
    await expect(page.locator('[data-test="toast-success"]')).toContainText(/draft/i);

    await page.click('[data-test="blog-preview-draft-button"]');
    await page.waitForSelector('[data-test="blog-preview-modal"]');
    await expect(page.locator('[data-test="blog-preview-title"]')).toContainText(
      'Draft post – E2E',
    );

    await takeIssueScreenshot(page, 'blog-draft-preview-flow-resolved.png');
  });

  test('Publishing flow: preview then publish', async ({ page }) => {
    await page.click('[data-test="blog-new-button"]');
    await page.fill('[data-test="blog-title-input"]', 'Publish post – E2E');
    await page.fill('[data-test="editor-content-area"]', 'Published content');

    await page.click('[data-test="blog-preview-button"]');
    await page.waitForSelector('[data-test="blog-preview-modal"]');
    await expect(page.locator('[data-test="blog-preview-title"]')).toContainText(
      'Publish post – E2E',
    );

    await page.click('[data-test="blog-publish-button"]');
    await expect(page.locator('[data-test="toast-success"]')).toContainText(/published/i);

    await takeIssueScreenshot(page, 'blog-publish-flow-resolved.png');
  });
});

