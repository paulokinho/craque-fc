import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { db } from '../lib/db';
import { groupMembers, users, groups } from '../../../api/src/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { QUEUE_NAMES } from '../queues';

type LeaderboardJob = { groupId?: string; competitionId?: string };

export const leaderboardWorker = new Worker<LeaderboardJob>(
  QUEUE_NAMES.LEADERBOARD,
  async (job: Job<LeaderboardJob>) => {
    console.log('📊 Recalculating leaderboards...');

    const allGroups = await db.select({ id: groups.id }).from(groups);

    for (const group of allGroups) {
      const memberScores = await db
        .select({
          userId: groupMembers.userId,
          totalEstrelas: users.estrelas,
        })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(eq(groupMembers.groupId, group.id))
        .orderBy(desc(users.estrelas));

      for (let i = 0; i < memberScores.length; i++) {
        await db.update(groupMembers)
          .set({ totalEstrelas: memberScores[i].totalEstrelas, rank: i + 1 })
          .where(and(
            eq(groupMembers.groupId, group.id),
            eq(groupMembers.userId, memberScores[i].userId)
          ));
      }
    }

    console.log(`✅ Recalculated rankings for ${allGroups.length} groups`);
  },
  { connection: redisConnection, concurrency: 2 }
);

leaderboardWorker.on('failed', (job, err) => {
  console.error(`❌ leaderboard job ${job?.id} failed:`, err.message);
});
