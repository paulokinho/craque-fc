import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { db } from '../lib/db';
import { predictions, prizes } from '../../../api/src/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { notificationsQueue, QUEUE_NAMES } from '../queues';

type PrizeJob = { roundSlug: string; competitionId: string };

const ROUND_PRIZE_POOL = [
  { type: 'ifood_100', description: 'iFood R$100', valueBrl: 100 },
  { type: 'psn_50', description: 'PSN R$50', valueBrl: 50 },
  { type: 'badge_craque', description: 'Badge Craque da Rodada', valueBrl: 0 },
];

export const prizesWorker = new Worker<PrizeJob>(
  QUEUE_NAMES.PRIZES,
  async (job: Job<PrizeJob>) => {
    const { roundSlug, competitionId } = job.data;
    console.log(`🏆 Determining prizes for round: ${roundSlug}`);

    const existing = await db.select().from(prizes)
      .where(and(eq(prizes.round, roundSlug), eq(prizes.competitionId, competitionId)))
      .limit(1);
    if (existing.length > 0) return;

    const topPredictions = await db
      .select({
        userId: predictions.userId,
        totalEstrelas: sql<number>`sum(${predictions.estrelasEarned})`.as('totalEstrelas'),
      })
      .from(predictions)
      .groupBy(predictions.userId)
      .orderBy(desc(sql`sum(${predictions.estrelasEarned})`))
      .limit(1);

    if (topPredictions.length === 0 || topPredictions[0].totalEstrelas === 0) return;

    const winnerId = topPredictions[0].userId;
    const prize = ROUND_PRIZE_POOL[Math.floor(Math.random() * ROUND_PRIZE_POOL.length)];

    await db.insert(prizes).values({
      round: roundSlug,
      competitionId,
      prizeType: prize.type,
      prizeValueBrl: prize.valueBrl.toString(),
      prizeDescription: prize.description,
      winnerId,
      claimDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await notificationsQueue.add('prize-won', {
      type: 'prize_won',
      userId: winnerId,
      payload: { prizeName: prize.description, roundSlug },
    });

    console.log(`🏆 Prize assigned: ${prize.type} to user ${winnerId}`);
  },
  { connection: redisConnection, concurrency: 1 }
);

prizesWorker.on('failed', (job, err) => {
  console.error(`❌ prizes job ${job?.id} failed:`, err.message);
});
