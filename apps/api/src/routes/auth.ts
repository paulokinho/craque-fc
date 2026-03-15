import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .use(cookie())
  .post('/register', async ({ body, jwt, cookie: { auth } }) => {
    const { email, password, username, displayName } = body;
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) throw new Error('Email já cadastrado');

    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername.length) throw new Error('Username já em uso');

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      email, passwordHash, username, displayName,
    }).returning();

    const token = await jwt.sign({ userId: user.id, username: user.username });
    auth.set({ value: token, httpOnly: true, secure: false, maxAge: 60 * 60 * 24 * 30, path: '/' });

    return { user: { id: user.id, username: user.username, displayName: user.displayName, estrelas: user.estrelas } };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
      username: t.String({ minLength: 3, maxLength: 20 }),
      displayName: t.String({ minLength: 2 }),
    })
  })

  .post('/login', async ({ body, jwt, cookie: { auth } }) => {
    const { email, password } = body;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new Error('Credenciais inválidas');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Credenciais inválidas');

    const token = await jwt.sign({ userId: user.id, username: user.username });
    auth.set({ value: token, httpOnly: true, secure: false, maxAge: 60 * 60 * 24 * 30, path: '/' });

    return { user: { id: user.id, username: user.username, displayName: user.displayName, estrelas: user.estrelas } };
  }, {
    body: t.Object({ email: t.String(), password: t.String() })
  })

  .post('/logout', ({ cookie: { auth } }) => {
    auth.remove();
    return { success: true };
  })

  .get('/me', async ({ jwt, cookie: { auth } }) => {
    const payload = await jwt.verify(auth.value as string | undefined);
    if (!payload) throw new Error('Não autenticado');
    const [user] = await db.select().from(users).where(eq(users.id, (payload as any).userId)).limit(1);
    if (!user) throw new Error('Usuário não encontrado');
    return {
      id: user.id, username: user.username, displayName: user.displayName,
      estrelas: user.estrelas, streak: user.streak, maxStreak: user.maxStreak,
      hasCopaPass: user.hasCopaPass, badges: user.badges,
      shieldsAvailable: user.shieldsAvailable, boostsAvailable: user.boostsAvailable,
    };
  });
