import { test, expect } from '@playwright/test';

test('landing page loads with Craque FC branding', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Craque FC/);
  await expect(page.locator('text=Craque FC').first()).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/landing.png', fullPage: true });
});

test('login page renders form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="submit-btn"]')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/login-page.png', fullPage: true });
});

test('login shows validation errors on empty submit', async ({ page }) => {
  await page.goto('/login');
  await page.click('[data-testid="submit-btn"]');
  await page.screenshot({ path: 'tests/screenshots/login-validation.png' });
  const errors = page.locator('.error');
  await expect(errors.first()).toBeVisible({ timeout: 3000 });
});

test('register page renders form', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="display-name-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="username-input"]')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/register-page.png', fullPage: true });
});

test('full register + login flow', async ({ page }) => {
  const uniqueEmail = `test_${Date.now()}@craquefc.test`;
  const uniqueUsername = `craque_${Date.now()}`;

  await page.goto('/register');
  await page.fill('[data-testid="display-name-input"]', 'Test Craque');
  await page.fill('[data-testid="username-input"]', uniqueUsername);
  await page.fill('[data-testid="email-input"]', uniqueEmail);
  await page.fill('[data-testid="password-input"]', 'Test1234!');
  await page.click('[data-testid="submit-btn"]');
  await page.screenshot({ path: 'tests/screenshots/after-register.png' });

  await expect(page).toHaveURL(/palpites/, { timeout: 10000 });
  await page.screenshot({ path: 'tests/screenshots/palpites-after-register.png', fullPage: true });
});
