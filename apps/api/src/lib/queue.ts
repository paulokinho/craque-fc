import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUE_NAMES } from './queueNames';
import type { ScoreResultsJob, LeaderboardJob, NotificationJob, PaymentJob, PrizeJob } from './jobTypes';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisConnection: any = null;

function getRedisConnection() {
  if (!redisConnection) {
    redisConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }
  return redisConnection;
}

function createQueue<T>(name: string, defaultJobOptions?: any): Queue<T> {
  try {
    return new Queue<T>(name, {
      connection: getRedisConnection(),
      defaultJobOptions: defaultJobOptions || {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
      },
    });
  } catch {
    return {
      add: async () => ({ id: 'mock' }),
      name,
    } as any;
  }
}

export const scoreResultsQueue = createQueue<ScoreResultsJob>(QUEUE_NAMES.SCORE_RESULTS);
export const leaderboardQueue = createQueue<LeaderboardJob>(QUEUE_NAMES.LEADERBOARD);
export const notificationsQueue = createQueue<NotificationJob>(QUEUE_NAMES.NOTIFICATIONS);
export const paymentsQueue = createQueue<PaymentJob>(QUEUE_NAMES.PAYMENTS);
export const prizesQueue = createQueue<PrizeJob>(QUEUE_NAMES.PRIZES);
