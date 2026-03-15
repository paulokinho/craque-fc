import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const email = `group_test_${Date.now()}@craquefc.test`;
  const username = `grp_${Date.now()}`;
  await page.request.post('http://localhost:3001/auth/register', {
    data: { email, password: 'Test1234!', username, displayName: 'Group Test' },
  });
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', 'Test1234!');
  await page.click('[data-testid="submit-btn"]');
  await page.waitForURL(/palpites/, { timeout: 10000 });
});

test('liga page renders with create group button', async ({ page }) => {
  await page.goto('/liga');
  await expect(page.locator('[data-testid="create-group-btn"]')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/liga-page.png', fullPage: true });
});

test('create group modal opens and has fields', async ({ page }) => {
  await page.goto('/liga');
  await page.click('[data-testid="create-group-btn"]');
  await expect(page.locator('[data-testid="create-group-modal"]')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/create-group-modal.png' });
});

test('join group modal opens with code input', async ({ page }) => {
  await page.goto('/liga');
  await page.click('text=Entrar em Bolão');
  await expect(page.locator('[data-testid="invite-code-input"]')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/join-group-modal.png' });
});
