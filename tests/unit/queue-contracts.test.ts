import { describe, it, expect } from 'vitest';
import { QUEUE_NAMES } from '../../apps/api/src/lib/queueNames';
import type {
  ScoreResultsJob, LeaderboardJob, NotificationJob,
  PaymentJob, PrizeJob
} from '../../apps/api/src/lib/jobTypes';

describe('queue contracts — ScoreResultsJob', () => {
  it('requires matchId, homeScore, awayScore', () => {
    const job: ScoreResultsJob = { matchId: 'abc', homeScore: 2, awayScore: 1 };
    expect(job.matchId).toBe('abc');
    expect(job.homeScore).toBe(2);
    expect(job.awayScore).toBe(1);
  });

  it('scores can be zero', () => {
    const job: ScoreResultsJob = { matchId: 'x', homeScore: 0, awayScore: 0 };
    expect(job.homeScore).toBe(0);
    expect(job.awayScore).toBe(0);
  });
});

describe('queue contracts — NotificationJob', () => {
  it('supports all 4 notification types', () => {
    const types: NotificationJob['type'][] = [
      'match_reminder', 'result_scored', 'prize_won', 'payment_confirmed'
    ];
    types.forEach(type => {
      const job: NotificationJob = { type, payload: {} };
      expect(job.type).toBe(type);
    });
  });

  it('userId is optional for broadcast', () => {
    const broadcast: NotificationJob = { type: 'match_reminder', payload: { matchId: 'x' } };
    expect(broadcast.userId).toBeUndefined();
  });

  it('userId targets a specific user', () => {
    const targeted: NotificationJob = { type: 'result_scored', userId: 'u1', payload: {} };
    expect(targeted.userId).toBe('u1');
  });
});

describe('queue contracts — PaymentJob', () => {
  it('requires stripeSessionId for idempotency', () => {
    const job: PaymentJob = { stripeSessionId: 'cs_123', userId: 'u1', productType: 'estrelas_100' };
    expect(job.stripeSessionId).toBeTruthy();
  });

  it('supports all product types', () => {
    const products = ['estrelas_100', 'estrelas_500', 'boost_x2', 'streak_shield', 'copa_pass_month'];
    products.forEach(p => {
      const job: PaymentJob = { stripeSessionId: `cs_${p}`, userId: 'u1', productType: p };
      expect(job.productType).toBe(p);
    });
  });
});

describe('queue contracts — PrizeJob', () => {
  it('requires roundSlug and competitionId', () => {
    const job: PrizeJob = { roundSlug: 'rodada-1', competitionId: 'comp-1' };
    expect(job.roundSlug).toBe('rodada-1');
    expect(job.competitionId).toBe('comp-1');
  });
});

describe('queue contracts — LeaderboardJob', () => {
  it('groupId is optional for global recalc', () => {
    const global: LeaderboardJob = {};
    expect(global.groupId).toBeUndefined();
  });

  it('competitionId is optional', () => {
    const job: LeaderboardJob = { competitionId: 'comp-1' };
    expect(job.competitionId).toBe('comp-1');
  });
});

describe('QUEUE_NAMES are stable strings', () => {
  it('names match expected conventions', () => {
    // All names use kebab-case
    Object.values(QUEUE_NAMES).forEach(name => {
      expect(name).toMatch(/^[a-z-]+$/);
    });
  });

  it('no duplicate queue names', () => {
    const values = Object.values(QUEUE_NAMES);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
