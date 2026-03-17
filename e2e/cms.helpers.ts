import { Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'test-results', 'screenshots');

export async function ensureScreenshotDir() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
}

export async function takeIssueScreenshot(page: Page, filename: string) {
  await ensureScreenshotDir();
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, filename),
    fullPage: true,
  });
}

// These can be overridden via environment variables in CI/local runs
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@emscale.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'admin123';

export async function loginToCms(page: Page) {
  await page.goto('/auth/login');

  // TODO: replace selectors with real ones or data-test attributes from the app
  await page.fill('[data-test="login-email-input"]', ADMIN_EMAIL);
  await page.fill('[data-test="login-password-input"]', ADMIN_PASSWORD);
  await page.click('[data-test="login-submit-button"]');

  await page.waitForURL('**/admin', { timeout: 20000 });
}

export async function gotoBlogModule(page: Page) {
  await page.click('[data-test="nav-blog"]');
  await page.waitForURL('**/admin/blog');
}

export async function gotoJobModule(page: Page) {
  await page.click('[data-test="nav-jobs"]');
  await page.waitForURL('**/admin/jobs');
}

export async function gotoTeamModule(page: Page) {
  await page.click('[data-test="nav-team"]');
  await page.waitForURL('**/admin/team');
}

