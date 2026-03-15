import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './routes/auth';
import { matchRoutes } from './routes/matches';
import { predictionRoutes } from './routes/predictions';
import { groupRoutes } from './routes/groups';
import { shopRoutes } from './routes/shop';
import { stripeWebhookRoutes } from './routes/stripe-webhook';
import { profileRoutes } from './routes/profile';
import { wsRoutes } from './routes/ws';

// Run migrations on startup
import { db } from './db/client';
import { sql } from 'drizzle-orm';
import * as schema from './db/schema';

async function runMigrations() {
  console.log('Running schema push...');
  // Use drizzle-kit push equivalent: create tables if not exist
  try {
    // Create enums
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished', 'cancelled');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE prediction_result AS ENUM ('exact', 'result', 'wrong', 'pending');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE stage AS ENUM ('group', 'round_of_16', 'quarter', 'semi', 'final');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

    // Create tables
    await db.execute(sql`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      avatar_frame TEXT DEFAULT 'default',
      estrelas INTEGER DEFAULT 0 NOT NULL,
      total_predictions INTEGER DEFAULT 0 NOT NULL,
      correct_predictions INTEGER DEFAULT 0 NOT NULL,
      exact_scores INTEGER DEFAULT 0 NOT NULL,
      streak INTEGER DEFAULT 0 NOT NULL,
      max_streak INTEGER DEFAULT 0 NOT NULL,
      has_copa_pass BOOLEAN DEFAULT false NOT NULL,
      copa_pass_expires_at TIMESTAMP,
      badges TEXT[] DEFAULT '{}' NOT NULL,
      shields_available INTEGER DEFAULT 0 NOT NULL,
      boosts_available INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS competitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      country TEXT,
      logo_url TEXT,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      country TEXT,
      logo_url TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID REFERENCES competitions(id),
      home_team_id UUID NOT NULL REFERENCES teams(id),
      away_team_id UUID NOT NULL REFERENCES teams(id),
      round TEXT,
      stage stage DEFAULT 'group' NOT NULL,
      kickoff_at TIMESTAMP NOT NULL,
      status match_status DEFAULT 'scheduled' NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      predictions_close_at TIMESTAMP,
      featured BOOLEAN DEFAULT false NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS predictions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      predicted_home_score INTEGER NOT NULL,
      predicted_away_score INTEGER NOT NULL,
      boost_active BOOLEAN DEFAULT false NOT NULL,
      shield_used BOOLEAN DEFAULT false NOT NULL,
      estrelas_earned INTEGER DEFAULT 0 NOT NULL,
      result prediction_result DEFAULT 'pending' NOT NULL,
      submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(user_id, match_id)
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      created_by UUID NOT NULL REFERENCES users(id),
      invite_code TEXT UNIQUE NOT NULL,
      competition_id UUID REFERENCES competitions(id),
      max_members INTEGER DEFAULT 50 NOT NULL,
      is_public BOOLEAN DEFAULT false NOT NULL,
      avatar_color TEXT DEFAULT '#185FA5' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS group_members (
      group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
      total_estrelas INTEGER DEFAULT 0 NOT NULL,
      rank INTEGER,
      PRIMARY KEY (group_id, user_id)
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      stripe_session_id TEXT UNIQUE,
      product_type TEXT NOT NULL,
      amount_brl NUMERIC(10, 2),
      estrelas_granted INTEGER DEFAULT 0 NOT NULL,
      status transaction_status DEFAULT 'pending' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS push_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(user_id, endpoint)
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS prizes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      round TEXT NOT NULL,
      competition_id UUID NOT NULL REFERENCES competitions(id),
      prize_type TEXT NOT NULL,
      prize_value_brl TEXT,
      prize_description TEXT,
      winner_id UUID REFERENCES users(id),
      claim_deadline TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id)`);

    console.log('Schema push complete');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

// Seed data if tables are empty
async function seedIfEmpty() {
  try {
    const existingTeams = await db.select().from(schema.teams).limit(1);
    if (existingTeams.length > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');
    const { competitions, teams, matches } = schema;

    const [copa] = await db.insert(competitions).values({
      name: 'Copa do Mundo FIFA 2026',
      slug: 'copa-mundo-2026',
      country: 'International',
    }).returning();

    const [brasileirao] = await db.insert(competitions).values({
      name: 'Brasileirão Série A 2026',
      slug: 'brasileirao-2026',
      country: 'Brazil',
    }).returning();

    const [bra, mar, hai, sco, fla, pal, cor, bot] = await db.insert(teams).values([
      { name: 'Brasil', shortName: 'BRA', country: 'Brazil' },
      { name: 'Marrocos', shortName: 'MAR', country: 'Morocco' },
      { name: 'Haiti', shortName: 'HAI', country: 'Haiti' },
      { name: 'Escócia', shortName: 'SCO', country: 'Scotland' },
      { name: 'Flamengo', shortName: 'FLA', country: 'Brazil' },
      { name: 'Palmeiras', shortName: 'PAL', country: 'Brazil' },
      { name: 'Corinthians', shortName: 'COR', country: 'Brazil' },
      { name: 'Botafogo', shortName: 'BOT', country: 'Brazil' },
    ]).returning();

    await db.insert(matches).values([
      {
        competitionId: copa.id,
        homeTeamId: bra.id,
        awayTeamId: mar.id,
        round: 'Grupo C — Rodada 1',
        stage: 'group',
        kickoffAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        featured: true,
      },
      {
        competitionId: copa.id,
        homeTeamId: hai.id,
        awayTeamId: sco.id,
        round: 'Grupo C — Rodada 1',
        stage: 'group',
        kickoffAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        featured: false,
      },
      {
        competitionId: brasileirao.id,
        homeTeamId: fla.id,
        awayTeamId: pal.id,
        round: 'Rodada 10',
        stage: 'group',
        kickoffAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        featured: false,
      },
      {
        competitionId: brasileirao.id,
        homeTeamId: cor.id,
        awayTeamId: bot.id,
        round: 'Rodada 10',
        stage: 'group',
        kickoffAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        featured: false,
      },
    ]);

    console.log('Seed complete');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

async function start() {
  await runMigrations();
  await seedIfEmpty();

  const app = new Elysia()
    .use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
    .use(swagger({ path: '/docs' }))
    .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
    .use(authRoutes)
    .use(matchRoutes)
    .use(predictionRoutes)
    .use(groupRoutes)
    .use(shopRoutes)
    .use(stripeWebhookRoutes)
    .use(profileRoutes)
    .use(wsRoutes)
    .listen(process.env.PORT || 3001);

  console.log(`🏟️  Craque FC API running at http://localhost:${app.server?.port}`);
}

start();
