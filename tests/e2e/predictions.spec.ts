import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const uniqueEmail = `pred_test_${Date.now()}@craquefc.test`;
  const uniqueUsername = `pred_${Date.now()}`;
  await page.request.post('http://localhost:3001/auth/register', {
    data: {
      email: uniqueEmail,
      password: 'Test1234!',
      username: uniqueUsername,
      displayName: 'Pred Test',
    },
  });
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', uniqueEmail);
  await page.fill('[data-testid="password-input"]', 'Test1234!');
  await page.click('[data-testid="submit-btn"]');
  await page.waitForURL(/palpites/, { timeout: 10000 });
});

test('palpites page shows match cards or empty state', async ({ page }) => {
  await page.goto('/palpites');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/palpites-home.png', fullPage: true });
  const hasCards = await page.locator('[data-testid="match-card"]').count() > 0;
  const hasEmpty = await page.locator('text=Sem partidas').isVisible().catch(() => false);
  expect(hasCards || hasEmpty).toBeTruthy();
});

test('estrelas balance visible in header', async ({ page }) => {
  await page.goto('/palpites');
  await expect(page.locator('[data-testid="estrelas-balance"]')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/estrelas-header.png' });
});

test('prediction flow: select outcome reveals score inputs', async ({ page }) => {
  await page.goto('/palpites');
  const firstCard = page.locator('[data-testid="match-card"]').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });
  await firstCard.locator('[data-testid="btn-home-win"]').click();
  await expect(firstCard.locator('[data-testid="score-home"]')).toBeVisible();
  await expect(firstCard.locator('[data-testid="score-away"]')).toBeVisible();
  await firstCard.locator('[data-testid="score-home"]').fill('2');
  await firstCard.locator('[data-testid="score-away"]').fill('0');
  await page.screenshot({ path: 'tests/screenshots/prediction-filled.png' });
});

test('bottom nav is visible', async ({ page }) => {
  await page.goto('/palpites');
  await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/bottom-nav.png' });
});
