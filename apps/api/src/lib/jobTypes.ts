export type ScoreResultsJob = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

export type LeaderboardJob = {
  groupId?: string;
  competitionId?: string;
};

export type NotificationJob = {
  type:
    | 'match_reminder'
    | 'result_scored'
    | 'prize_won'
    | 'payment_confirmed';
  userId?: string;
  payload: Record<string, unknown>;
};

export type PaymentJob = {
  stripeSessionId: string;
  userId: string;
  productType: string;
};

export type PrizeJob = {
  roundSlug: string;
  competitionId: string;
};
