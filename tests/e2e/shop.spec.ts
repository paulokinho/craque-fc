import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const email = `shop_test_${Date.now()}@craquefc.test`;
  const username = `shp_${Date.now()}`;
  await page.request.post('http://localhost:3001/auth/register', {
    data: { email, password: 'Test1234!', username, displayName: 'Shop Test' },
  });
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', 'Test1234!');
  await page.click('[data-testid="submit-btn"]');
  await page.waitForURL(/palpites/, { timeout: 10000 });
});

test('shop page renders with all items', async ({ page }) => {
  await page.goto('/loja');
  await page.screenshot({ path: 'tests/screenshots/shop-page.png', fullPage: true });
  const items = page.locator('[data-testid="shop-item"]');
  await expect(items).toHaveCount(5);
});

test('Copa Pass is visible with price R$ 9,90', async ({ page }) => {
  await page.goto('/loja');
  await expect(page.locator('text=Copa Pass')).toBeVisible();
  await expect(page.locator('text=R$ 9,90').or(page.locator('text=9,90'))).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/copa-pass-visible.png' });
});

test('Escudo and Boost items visible', async ({ page }) => {
  await page.goto('/loja');
  await expect(page.locator('text=Escudo')).toBeVisible();
  await expect(page.locator('text=Boost')).toBeVisible();
});
