import { db } from './client';
import { competitions, teams, matches } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

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

  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch(console.error);
