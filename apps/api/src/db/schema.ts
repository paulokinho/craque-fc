import {
  pgTable, uuid, text, integer, boolean, timestamp,
  unique, index, primaryKey, numeric, pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const matchStatusEnum = pgEnum('match_status', [
  'scheduled', 'live', 'finished', 'cancelled'
]);
export const predictionResultEnum = pgEnum('prediction_result', [
  'exact', 'result', 'wrong', 'pending'
]);
export const stageEnum = pgEnum('stage', [
  'group', 'round_of_16', 'quarter', 'semi', 'final'
]);
export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending', 'completed', 'failed'
]);

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  username: text('username').unique().notNull(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  avatarFrame: text('avatar_frame').default('default'),
  estrelas: integer('estrelas').default(0).notNull(),
  totalPredictions: integer('total_predictions').default(0).notNull(),
  correctPredictions: integer('correct_predictions').default(0).notNull(),
  exactScores: integer('exact_scores').default(0).notNull(),
  streak: integer('streak').default(0).notNull(),
  maxStreak: integer('max_streak').default(0).notNull(),
  hasCopaPass: boolean('has_copa_pass').default(false).notNull(),
  copaPassExpiresAt: timestamp('copa_pass_expires_at'),
  badges: text('badges').array().default([]).notNull(),
  shieldsAvailable: integer('shields_available').default(0).notNull(),
  boostsAvailable: integer('boosts_available').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Competitions
export const competitions = pgTable('competitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  country: text('country'),
  logoUrl: text('logo_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Teams
export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  country: text('country'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Matches
export const matches = pgTable('matches', {
  id: uuid('id').defaultRandom().primaryKey(),
  competitionId: uuid('competition_id').references(() => competitions.id),
  homeTeamId: uuid('home_team_id').references(() => teams.id).notNull(),
  awayTeamId: uuid('away_team_id').references(() => teams.id).notNull(),
  round: text('round'),
  stage: stageEnum('stage').default('group').notNull(),
  kickoffAt: timestamp('kickoff_at').notNull(),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  predictionsCloseAt: timestamp('predictions_close_at'),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  kickoffIdx: index('idx_matches_kickoff').on(t.kickoffAt),
  statusIdx: index('idx_matches_status').on(t.status),
}));

// Predictions
export const predictions = pgTable('predictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  predictedHomeScore: integer('predicted_home_score').notNull(),
  predictedAwayScore: integer('predicted_away_score').notNull(),
  boostActive: boolean('boost_active').default(false).notNull(),
  shieldUsed: boolean('shield_used').default(false).notNull(),
  estrelasEarned: integer('estrelas_earned').default(0).notNull(),
  result: predictionResultEnum('result').default('pending').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
}, (t) => ({
  userMatchUniq: unique().on(t.userId, t.matchId),
  userIdx: index('idx_predictions_user').on(t.userId),
  matchIdx: index('idx_predictions_match').on(t.matchId),
}));

// Groups (Bolões)
export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  inviteCode: text('invite_code').unique().notNull(),
  competitionId: uuid('competition_id').references(() => competitions.id),
  maxMembers: integer('max_members').default(50).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  avatarColor: text('avatar_color').default('#185FA5').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Group members
export const groupMembers = pgTable('group_members', {
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  totalEstrelas: integer('total_estrelas').default(0).notNull(),
  rank: integer('rank'),
}, (t) => ({
  pk: primaryKey({ columns: [t.groupId, t.userId] }),
  userIdx: index('idx_group_members_user').on(t.userId),
}));

// IAP Transactions
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  stripeSessionId: text('stripe_session_id').unique(),
  productType: text('product_type').notNull(),
  amountBrl: numeric('amount_brl', { precision: 10, scale: 2 }),
  estrelasGranted: integer('estrelas_granted').default(0).notNull(),
  status: transactionStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Push subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userEndpointUniq: unique().on(t.userId, t.endpoint),
}));

// Prizes
export const prizes = pgTable('prizes', {
  id: uuid('id').defaultRandom().primaryKey(),
  round: text('round').notNull(),
  competitionId: uuid('competition_id').references(() => competitions.id).notNull(),
  prizeType: text('prize_type').notNull(),
  prizeValueBrl: text('prize_value_brl'),
  prizeDescription: text('prize_description'),
  winnerId: uuid('winner_id').references(() => users.id),
  claimDeadline: timestamp('claim_deadline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  predictions: many(predictions),
  groupMemberships: many(groupMembers),
  transactions: many(transactions),
  ownedGroups: many(groups),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  competition: one(competitions, { fields: [matches.competitionId], references: [competitions.id] }),
  homeTeam: one(teams, { fields: [matches.homeTeamId], references: [teams.id] }),
  awayTeam: one(teams, { fields: [matches.awayTeamId], references: [teams.id] }),
  predictions: many(predictions),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, { fields: [predictions.userId], references: [users.id] }),
  match: one(matches, { fields: [predictions.matchId], references: [matches.id] }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, { fields: [groups.createdBy], references: [users.id] }),
  competition: one(competitions, { fields: [groups.competitionId], references: [competitions.id] }),
  members: many(groupMembers),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type Team = typeof teams.$inferSelect;
