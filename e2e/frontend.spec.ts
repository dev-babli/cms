import { test, expect } from '@playwright/test';
import { takeIssueScreenshot } from './cms.helpers';

test.describe('Category 4: Live Website / Frontend Output', () => {
  test('Service page opens correctly', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('[data-test="services-main-content"]')).toBeVisible();

    await takeIssueScreenshot(page, 'frontend-service-page-open-resolved.png');
  });

  test('Published blog titles display on single horizontal line', async ({ page }) => {
    await page.goto('/blog');
    const titles = page.locator('[data-test="blog-list-title"]');

    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      const text = (await titles.nth(i).textContent()) || '';
      expect(text).not.toMatch(/\n/);
    }

    await takeIssueScreenshot(page, 'frontend-blog-titles-single-line-resolved.png');
  });

  test('Published blogs display bullet points and numbered lists', async ({ page }) => {
    await page.goto('/blog');
    const firstBlogLink = page.locator('[data-test="blog-card-link"]').first();
    const href = await firstBlogLink.getAttribute('href');
    if (!href) {
      test.skip(true, 'No blog posts found for list rendering check');
      return;
    }

    await page.goto(href);
    const unordered = page.locator('article ul li');
    const ordered = page.locator('article ol li');

    await expect(unordered.first()).toBeVisible();
    await expect(ordered.first()).toBeVisible();

    await takeIssueScreenshot(page, 'frontend-blog-lists-rendering-resolved.png');
  });
});

