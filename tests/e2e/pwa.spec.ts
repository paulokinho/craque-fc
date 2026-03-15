import { test, expect } from '@playwright/test';

test('meta theme-color tag present', async ({ page }) => {
  await page.goto('/');
  const themeColor = await page.getAttribute('meta[name="theme-color"]', 'content');
  expect(themeColor).toBe('#F9CB42');
});

test('page loads without errors', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await page.screenshot({ path: 'tests/screenshots/pwa-landing.png', fullPage: true });
});

test('no horizontal overflow on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  await page.screenshot({ path: 'tests/screenshots/pwa-mobile-390.png', fullPage: true });
});

test('no horizontal overflow on Pixel 5', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 851 });
  await page.goto('/');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
});
