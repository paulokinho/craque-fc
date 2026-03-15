import { Queue } from 'bullmq';
import { redisConnection } from './lib/redis';

export const QUEUE_NAMES = {
  SCORE_RESULTS:  'score-results',
  LEADERBOARD:    'leaderboard',
  NOTIFICATIONS:  'notifications',
  PAYMENTS:       'payments',
  PRIZES:         'prizes',
} as const;

export const leaderboardQueue = new Queue(QUEUE_NAMES.LEADERBOARD, { connection: redisConnection as any });
export const notificationsQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, { connection: redisConnection as any });
export const prizesQueue = new Queue(QUEUE_NAMES.PRIZES, { connection: redisConnection as any });
