import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { users, predictions } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const profileRoutes = new Elysia({ prefix: '/profile' })
  .use(authMiddleware)
  .get('/', async (ctx) => {
    const userId = (ctx as any).userId as string;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error('Usuário não encontrado');
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      avatarFrame: user.avatarFrame,
      estrelas: user.estrelas,
      totalPredictions: user.totalPredictions,
      correctPredictions: user.correctPredictions,
      exactScores: user.exactScores,
      streak: user.streak,
      maxStreak: user.maxStreak,
      hasCopaPass: user.hasCopaPass,
      badges: user.badges,
      shieldsAvailable: user.shieldsAvailable,
      boostsAvailable: user.boostsAvailable,
    };
  })
  .put('/', async (ctx) => {
    const userId = (ctx as any).userId as string;
    const { body } = ctx;
    const [updated] = await db.update(users).set({
      displayName: body.displayName,
      avatarUrl: body.avatarUrl,
    }).where(eq(users.id, userId)).returning();
    return updated;
  }, {
    body: t.Object({
      displayName: t.Optional(t.String()),
      avatarUrl: t.Optional(t.String()),
    }),
  })
  .get('/predictions', async (ctx) => {
    const userId = (ctx as any).userId as string;
    return await db.select().from(predictions)
      .where(eq(predictions.userId, userId))
      .orderBy(desc(predictions.submittedAt))
      .limit(10);
  });
