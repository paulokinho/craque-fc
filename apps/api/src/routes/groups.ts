import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { groups, groupMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { generateInviteCode } from '../lib/utils';

export const groupRoutes = new Elysia({ prefix: '/groups' })
  .use(authMiddleware)
  .post('/', async (ctx) => {
    const { body } = ctx;
    const userId = (ctx as any).userId as string;
    const inviteCode = generateInviteCode();
    const [group] = await db.insert(groups).values({
      name: body.name,
      description: body.description,
      createdBy: userId,
      inviteCode,
      competitionId: body.competitionId,
      isPublic: body.isPublic ?? false,
    }).returning();

    await db.insert(groupMembers).values({ groupId: group.id, userId });
    return group;
  }, {
    body: t.Object({
      name: t.String({ minLength: 3 }),
      description: t.Optional(t.String()),
      competitionId: t.Optional(t.String()),
      isPublic: t.Optional(t.Boolean()),
    }),
  })

  .post('/join', async (ctx) => {
    const { body } = ctx;
    const userId = (ctx as any).userId as string;
    const [group] = await db.select().from(groups).where(eq(groups.inviteCode, body.code.toUpperCase())).limit(1);
    if (!group) throw new Error('Código de convite inválido');

    const existingMember = await db.select().from(groupMembers)
      .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, userId))).limit(1);
    if (existingMember.length) throw new Error('Você já está neste bolão');

    const memberCount = await db.select().from(groupMembers).where(eq(groupMembers.groupId, group.id));
    if (memberCount.length >= group.maxMembers) throw new Error('Bolão lotado');

    await db.insert(groupMembers).values({ groupId: group.id, userId });
    return { success: true, group };
  }, {
    body: t.Object({ code: t.String({ minLength: 6, maxLength: 6 }) }),
  })

  .get('/my', async (ctx) => {
    const userId = (ctx as any).userId as string;
    return await db.select({
      group: groups,
      totalEstrelas: groupMembers.totalEstrelas,
      rank: groupMembers.rank,
    }).from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId));
  });
