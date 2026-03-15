import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { matches, teams, competitions } from '../db/schema';
import { eq, gte, asc, and, sql } from 'drizzle-orm';
import { scoreResultsQueue, notificationsQueue } from '../lib/queue';
import { authMiddleware } from '../middleware/auth';

export const matchRoutes = new Elysia({ prefix: '/matches' })
  .get('/', async () => {
    const allMatches = await db
      .select()
      .from(matches)
      .orderBy(asc(matches.kickoffAt))
      .limit(20);

    const result = [];
    for (const match of allMatches) {
      const [homeTeam] = await db.select().from(teams).where(eq(teams.id, match.homeTeamId)).limit(1);
      const [awayTeam] = await db.select().from(teams).where(eq(teams.id, match.awayTeamId)).limit(1);
      let competition = null;
      if (match.competitionId) {
        const [comp] = await db.select().from(competitions).where(eq(competitions.id, match.competitionId)).limit(1);
        competition = comp || null;
      }
      result.push({
        ...match,
        homeTeam: homeTeam || null,
        awayTeam: awayTeam || null,
        competition,
      });
    }
    return result;
  })

  .get('/upcoming', async () => {
    return await db
      .select()
      .from(matches)
      .where(and(
        gte(matches.kickoffAt, new Date()),
        eq(matches.status, 'scheduled')
      ))
      .orderBy(asc(matches.kickoffAt))
      .limit(10);
  })

  .use(authMiddleware)
  .patch('/:id/result', async ({ params, body }) => {
    const [match] = await db
      .update(matches)
      .set({
        homeScore: body.homeScore,
        awayScore: body.awayScore,
        status: 'finished',
      })
      .where(eq(matches.id, params.id))
      .returning();

    await scoreResultsQueue.add('score-match' as any, {
      matchId: match.id,
      homeScore: body.homeScore,
      awayScore: body.awayScore,
    });

    return { success: true, message: 'Resultado registrado. Pontuação em processamento.' };
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({ homeScore: t.Integer({ minimum: 0 }), awayScore: t.Integer({ minimum: 0 }) }),
  });
