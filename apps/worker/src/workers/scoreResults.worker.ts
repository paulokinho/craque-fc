import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { db } from '../lib/db';
import { predictions, users, matches } from '../../../api/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculatePoints } from '../../../api/src/services/scoring';
import { leaderboardQueue, notificationsQueue, prizesQueue, QUEUE_NAMES } from '../queues';

type ScoreResultsJob = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

export const scoreResultsWorker = new Worker<ScoreResultsJob>(
  QUEUE_NAMES.SCORE_RESULTS,
  async (job: Job<ScoreResultsJob>) => {
    const { matchId, homeScore, awayScore } = job.data;
    console.log(`📊 Scoring match ${matchId}: ${homeScore}-${awayScore}`);

    const matchPredictions = await db
      .select()
      .from(predictions)
      .where(and(
        eq(predictions.matchId, matchId),
        eq(predictions.result, 'pending')
      ));

    if (matchPredictions.length === 0) {
      console.log(`No pending predictions for match ${matchId}`);
      return;
    }

    const updates = matchPredictions.map(pred => {
      const { estrelas, type } = calculatePoints(
        {
          predictedHome: pred.predictedHomeScore,
          predictedAway: pred.predictedAwayScore,
          boostActive: pred.boostActive,
        },
        { home: homeScore, away: awayScore }
      );
      return { pred, estrelas, type };
    });

    for (const { pred, estrelas, type } of updates) {
      await db.update(predictions)
        .set({ estrelasEarned: estrelas, result: type })
        .where(eq(predictions.id, pred.id));

      const [user] = await db.select().from(users).where(eq(users.id, pred.userId)).limit(1);
      if (!user) continue;

      const isCorrect = type !== 'wrong';
      const newStreak = isCorrect ? user.streak + 1 : (pred.shieldUsed ? user.streak : 0);
      const streakBonus = newStreak > 3 ? 20 * (newStreak - 3) : 0;
      const totalEstrelas = estrelas + streakBonus;

      await db.update(users).set({
        estrelas: user.estrelas + totalEstrelas,
        totalPredictions: user.totalPredictions + 1,
        correctPredictions: user.correctPredictions + (isCorrect ? 1 : 0),
        exactScores: user.exactScores + (type === 'exact' ? 1 : 0),
        streak: newStreak,
        maxStreak: Math.max(user.maxStreak, newStreak),
        shieldsAvailable: (type === 'wrong' && user.streak > 0 && user.shieldsAvailable > 0)
          ? user.shieldsAvailable - 1
          : user.shieldsAvailable,
      }).where(eq(users.id, pred.userId));

      await notificationsQueue.add('result-notification', {
        type: 'result_scored',
        userId: pred.userId,
        payload: { matchId, estrelasEarned: totalEstrelas, predictionType: type, newStreak },
      });
    }

    await leaderboardQueue.add('recalculate', { competitionId: undefined }, {
      jobId: `leaderboard-after-match-${matchId}`,
      delay: 2000,
    });

    const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
    if (match[0]?.competitionId) {
      await prizesQueue.add('check-prizes', {
        roundSlug: match[0].round ?? 'unknown',
        competitionId: match[0].competitionId,
      }, { jobId: `prizes-${matchId}` });
    }

    console.log(`✅ Scored ${updates.length} predictions for match ${matchId}`);
  },
  { connection: redisConnection, concurrency: 1, limiter: { max: 10, duration: 1000 } }
);

scoreResultsWorker.on('failed', (job, err) => {
  console.error(`❌ scoreResults job ${job?.id} failed:`, err.message);
});
