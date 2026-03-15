import { describe, it, expect } from 'vitest';
import { QUEUE_NAMES } from '../../apps/api/src/lib/queueNames';
import type { ScoreResultsJob, NotificationJob, PaymentJob, PrizeJob, LeaderboardJob } from '../../apps/api/src/lib/jobTypes';

describe('QUEUE_NAMES', () => {
  it('defines all required queue names as stable string constants', () => {
    expect(QUEUE_NAMES.SCORE_RESULTS).toBe('score-results');
    expect(QUEUE_NAMES.LEADERBOARD).toBe('leaderboard');
    expect(QUEUE_NAMES.NOTIFICATIONS).toBe('notifications');
    expect(QUEUE_NAMES.PAYMENTS).toBe('payments');
    expect(QUEUE_NAMES.PRIZES).toBe('prizes');
  });

  it('has exactly 5 queues defined', () => {
    expect(Object.keys(QUEUE_NAMES)).toHaveLength(5);
  });
});

describe('job payload shapes (type-level tests)', () => {
  it('ScoreResultsJob has required fields', () => {
    const job: ScoreResultsJob = { matchId: 'uuid-1', homeScore: 2, awayScore: 1 };
    expect(job.matchId).toBeDefined();
    expect(typeof job.homeScore).toBe('number');
    expect(typeof job.awayScore).toBe('number');
  });

  it('NotificationJob userId is optional (broadcast vs targeted)', () => {
    const broadcast: NotificationJob = { type: 'match_reminder', payload: { matchId: 'x' } };
    const targeted: NotificationJob = { type: 'result_scored', userId: 'user-1', payload: {} };
    expect(broadcast.userId).toBeUndefined();
    expect(targeted.userId).toBe('user-1');
  });

  it('PaymentJob has all required fields for idempotency', () => {
    const job: PaymentJob = {
      stripeSessionId: 'cs_test_123',
      userId: 'user-1',
      productType: 'estrelas_500',
    };
    expect(job.stripeSessionId).toBeTruthy();
    expect(job.userId).toBeTruthy();
    expect(job.productType).toBeTruthy();
  });
});
