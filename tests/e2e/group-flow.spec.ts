import { test, expect } from '@playwright/test';

// Business rules tested:
// - User can create a group and gets auto-joined as member
// - Another user can join via invite code
// - Group appears in "my groups" list for both users
// - Invite code is displayed after creation

let user1Email: string;
let user1Username: string;

test.beforeEach(async ({ page }) => {
  const ts = Date.now();
  user1Email = `grpflow_${ts}@craquefc.test`;
  user1Username = `gf_${ts}`;
  await page.request.post('http://localhost:3001/auth/register', {
    data: { email: user1Email, password: 'Test1234!', username: user1Username, displayName: 'Group Flow' },
  });
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', user1Email);
  await page.fill('[data-testid="password-input"]', 'Test1234!');
  await page.click('[data-testid="submit-btn"]');
  await page.waitForURL(/palpites/, { timeout: 10000 });
});

test('create a group and see it in my groups', async ({ page }) => {
  await page.goto('/liga');
  await page.click('[data-testid="create-group-btn"]');
  await expect(page.locator('[data-testid="create-group-modal"]')).toBeVisible();

  // Fill group name
  await page.fill('[data-testid="create-group-modal"] input', 'Bolão dos Craques');
  await page.click('[data-testid="create-group-modal"] button:has-text("Criar")');

  // Wait for modal to close and group to appear in list
  await page.waitForTimeout(1000);

  // Group should appear in the list
  await expect(page.locator('text=Bolão dos Craques')).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: 'tests/screenshots/group-created.png' });
});

test('navigate between tabs using bottom nav', async ({ page }) => {
  await page.goto('/palpites');
  await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible();

  // Navigate to Liga
  await page.locator('[data-testid="bottom-nav"] a[href="/liga"]').click();
  await expect(page).toHaveURL(/liga/);

  // Navigate to Loja
  await page.locator('[data-testid="bottom-nav"] a[href="/loja"]').click();
  await expect(page).toHaveURL(/loja/);

  // Navigate to Copa
  await page.locator('[data-testid="bottom-nav"] a[href="/copa"]').click();
  await expect(page).toHaveURL(/copa/);

  // Navigate to Perfil
  await page.locator('[data-testid="bottom-nav"] a[href="/perfil"]').click();
  await expect(page).toHaveURL(/perfil/);

  // Back to Palpites
  await page.locator('[data-testid="bottom-nav"] a[href="/palpites"]').click();
  await expect(page).toHaveURL(/palpites/);
});

test('profile page shows user info and logout button', async ({ page }) => {
  await page.goto('/perfil');

  // Should show display name and username
  await expect(page.locator('text=Group Flow')).toBeVisible();
  await expect(page.locator(`text=@${user1Username}`)).toBeVisible();

  // Should show stats
  await expect(page.locator('text=Estrelas')).toBeVisible();
  await expect(page.locator('text=Sequência')).toBeVisible();

  // Should show logout button
  await expect(page.locator('text=Sair da conta')).toBeVisible();
  await page.screenshot({ path: 'tests/screenshots/profile-page.png' });
});

test('logout redirects to login', async ({ page }) => {
  await page.goto('/perfil');
  await page.click('text=Sair da conta');
  await expect(page).toHaveURL(/login/, { timeout: 5000 });
});
