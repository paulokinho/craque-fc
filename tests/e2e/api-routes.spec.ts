import { test, expect } from '@playwright/test';

// Integration tests for API routes via Playwright's request context
// Tests business rules at the HTTP level without a browser

const API = 'http://localhost:3001';

test.describe('API: /health', () => {
  test('returns 200 with status ok', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeTruthy();
  });
});

test.describe('API: /auth', () => {
  test('register creates user and returns user object', async ({ request }) => {
    const ts = Date.now();
    const res = await request.post(`${API}/auth/register`, {
      data: {
        email: `api_reg_${ts}@craquefc.test`,
        password: 'Test1234!',
        username: `api_${ts}`,
        displayName: 'API Test User',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user.id).toBeTruthy();
    expect(body.user.username).toBe(`api_${ts}`);
    expect(body.user.displayName).toBe('API Test User');
    expect(body.user.estrelas).toBe(0);
    // Should NOT return passwordHash
    expect(body.user.passwordHash).toBeUndefined();
  });

  test('register with duplicate email fails', async ({ request }) => {
    const ts = Date.now();
    const email = `dup_${ts}@craquefc.test`;
    await request.post(`${API}/auth/register`, {
      data: { email, password: 'Test1234!', username: `dup1_${ts}`, displayName: 'Dup 1' },
    });
    const res = await request.post(`${API}/auth/register`, {
      data: { email, password: 'Test1234!', username: `dup2_${ts}`, displayName: 'Dup 2' },
    });
    expect(res.status()).toBe(500);
  });

  test('register with duplicate username fails', async ({ request }) => {
    const r = Math.random().toString(36).slice(2, 8);
    const username = `dupuser_${r}`;
    const first = await request.post(`${API}/auth/register`, {
      data: { email: `dupA_${r}@craquefc.test`, password: 'Test1234!', username, displayName: 'Dup A' },
    });
    expect(first.status()).toBe(200);
    const res = await request.post(`${API}/auth/register`, {
      data: { email: `dupB_${r}@craquefc.test`, password: 'Test1234!', username, displayName: 'Dup B' },
    });
    expect(res.status()).toBe(500);
  });

  test('login with correct credentials returns user', async ({ request }) => {
    const ts = Date.now();
    const email = `login_${ts}@craquefc.test`;
    await request.post(`${API}/auth/register`, {
      data: { email, password: 'Test1234!', username: `login_${ts}`, displayName: 'Login Test' },
    });
    const res = await request.post(`${API}/auth/login`, {
      data: { email, password: 'Test1234!' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user.displayName).toBe('Login Test');
  });

  test('login with wrong password fails', async ({ request }) => {
    const ts = Date.now();
    const email = `wrong_${ts}@craquefc.test`;
    await request.post(`${API}/auth/register`, {
      data: { email, password: 'Test1234!', username: `wrong_${ts}`, displayName: 'Wrong' },
    });
    const res = await request.post(`${API}/auth/login`, {
      data: { email, password: 'WrongPassword!' },
    });
    expect(res.status()).toBe(500);
  });
});

test.describe('API: /matches', () => {
  test('GET / returns array of matches with team data', async ({ request }) => {
    const res = await request.get(`${API}/matches/`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    // First match should have team info from seed
    const match = body[0];
    expect(match.id).toBeTruthy();
    expect(match.homeTeam).toBeTruthy();
    expect(match.awayTeam).toBeTruthy();
    expect(match.homeTeam.shortName).toBeTruthy();
  });

  test('GET /upcoming returns only scheduled future matches', async ({ request }) => {
    const res = await request.get(`${API}/matches/upcoming`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    for (const match of body) {
      expect(match.status).toBe('scheduled');
      expect(new Date(match.kickoffAt).getTime()).toBeGreaterThan(Date.now());
    }
  });
});

test.describe('API: /shop', () => {
  test('GET /items returns 5 shop items', async ({ request }) => {
    const res = await request.get(`${API}/shop/items`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(5);
    const ids = body.map((i: any) => i.id);
    expect(ids).toContain('estrelas_100');
    expect(ids).toContain('estrelas_500');
    expect(ids).toContain('boost_x2');
    expect(ids).toContain('streak_shield');
    expect(ids).toContain('copa_pass_month');
  });
});
