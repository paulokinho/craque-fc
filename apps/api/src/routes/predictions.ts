import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { predictions, matches } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const predictionRoutes = new Elysia({ prefix: '/predictions' })
  .use(authMiddleware)
  .post('/', async (ctx) => {
    const { body } = ctx;
    const userId = (ctx as any).userId as string;
    const { matchId, predictedHomeScore, predictedAwayScore, boostActive } = body;

    const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
    if (!match) throw new Error('Partida não encontrada');
    if (match.status !== 'scheduled') throw new Error('Palpites encerrados para esta partida');

    const closeTime = match.predictionsCloseAt || new Date(match.kickoffAt.getTime() - 30 * 60 * 1000);
    if (new Date() > closeTime) throw new Error('Palpites encerrados');

    const existing = await db.select().from(predictions)
      .where(and(eq(predictions.userId, userId), eq(predictions.matchId, matchId)))
      .limit(1);

    if (existing.length) {
      const [updated] = await db.update(predictions)
        .set({ predictedHomeScore, predictedAwayScore, boostActive: boostActive ?? false })
        .where(eq(predictions.id, existing[0].id))
        .returning();
      return updated;
    }

    try {
      const [prediction] = await db.insert(predictions).values({
        userId,
        matchId,
        predictedHomeScore,
        predictedAwayScore,
        boostActive: boostActive ?? false,
      }).returning();
      return prediction;
    } catch (err: any) {
      console.error('Prediction insert error:', err.message, { userId, matchId, predictedHomeScore, predictedAwayScore, boostActive });
      throw err;
    }
  }, {
    body: t.Object({
      matchId: t.String(),
      predictedHomeScore: t.Integer({ minimum: 0 }),
      predictedAwayScore: t.Integer({ minimum: 0 }),
      boostActive: t.Optional(t.Boolean()),
    }),
  })

  .get('/my', async (ctx) => {
    const userId = (ctx as any).userId as string;
    return await db.select().from(predictions).where(eq(predictions.userId, userId));
  })

  .get('/match/:matchId', async (ctx) => {
    const userId = (ctx as any).userId as string;
    const [prediction] = await db.select().from(predictions)
      .where(and(eq(predictions.userId, userId), eq(predictions.matchId, ctx.params.matchId)))
      .limit(1);
    return prediction || null;
  }, {
    params: t.Object({ matchId: t.String() }),
  });
