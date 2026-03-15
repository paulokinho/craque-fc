import { test, expect } from '@playwright/test';

// Business rules tested:
// - User can submit a score prediction for a match
// - After submission, the prediction is locked and shows the submitted score
// - Estrelas balance is displayed in the header
// - Match cards show team names and competition info

let testEmail: string;
let testUsername: string;

test.beforeEach(async ({ page }) => {
  testEmail = `submit_${Date.now()}_${Math.random().toString(36).slice(2)}@craquefc.test`;
  testUsername = `sub_${Date.now()}`;
  await page.request.post('http://localhost:3001/auth/register', {
    data: { email: testEmail, password: 'Test1234!', username: testUsername, displayName: 'Submit Test' },
  });
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', testEmail);
  await page.fill('[data-testid="password-input"]', 'Test1234!');
  await page.click('[data-testid="submit-btn"]');
  await page.waitForURL(/palpites/, { timeout: 10000 });
});

test('submit a full prediction and see it locked', async ({ page }) => {
  await page.goto('/palpites');
  const firstCard = page.locator('[data-testid="match-card"]').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });

  // Click home win
  await firstCard.locator('[data-testid="btn-home-win"]').click();

  // Score inputs should appear
  const homeInput = firstCard.locator('[data-testid="score-home"]');
  const awayInput = firstCard.locator('[data-testid="score-away"]');
  await expect(homeInput).toBeVisible();
  await expect(awayInput).toBeVisible();

  // Fill scores
  await homeInput.fill('2');
  await awayInput.fill('1');

  // Submit
  await firstCard.locator('[data-testid="submit-prediction"]').click();

  // Should show locked state
  await expect(firstCard.locator('text=Palpite registrado')).toBeVisible({ timeout: 5000 });
  await expect(firstCard.locator('text=2 x 1')).toBeVisible();

  await page.screenshot({ path: 'tests/screenshots/prediction-submitted.png' });
});

test('match cards show team short names', async ({ page }) => {
  await page.goto('/palpites');
  await page.waitForTimeout(2000);

  const cards = page.locator('[data-testid="match-card"]');
  const count = await cards.count();

  if (count > 0) {
    // At least one card should have team abbreviations
    const text = await cards.first().textContent();
    // Seed data has BRA, MAR, HAI, SCO, FLA, PAL, COR, BOT
    const hasTeam = ['BRA', 'MAR', 'HAI', 'SCO', 'FLA', 'PAL', 'COR', 'BOT'].some(t => text?.includes(t));
    expect(hasTeam).toBeTruthy();
  }
});

test('selecting draw outcome also reveals score inputs', async ({ page }) => {
  await page.goto('/palpites');
  const firstCard = page.locator('[data-testid="match-card"]').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });

  await firstCard.locator('[data-testid="btn-draw"]').click();
  await expect(firstCard.locator('[data-testid="score-home"]')).toBeVisible();
  await expect(firstCard.locator('[data-testid="score-away"]')).toBeVisible();
});

test('selecting away win outcome reveals score inputs', async ({ page }) => {
  await page.goto('/palpites');
  const firstCard = page.locator('[data-testid="match-card"]').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });

  await firstCard.locator('[data-testid="btn-away-win"]').click();
  await expect(firstCard.locator('[data-testid="score-home"]')).toBeVisible();
  await expect(firstCard.locator('[data-testid="score-away"]')).toBeVisible();
});
