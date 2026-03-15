import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { db } from '../lib/db';
import { users, transactions } from '../../../api/src/db/schema';
import { eq } from 'drizzle-orm';
import { notificationsQueue, QUEUE_NAMES } from '../queues';

type PaymentJob = { stripeSessionId: string; userId: string; productType: string };

const PRODUCT_GRANTS: Record<string, { estrelas: number; item?: string }> = {
  estrelas_100: { estrelas: 100 },
  estrelas_500: { estrelas: 500 },
  boost_x2: { estrelas: 0, item: 'boost' },
  streak_shield: { estrelas: 0, item: 'shield' },
  copa_pass_month: { estrelas: 200, item: 'copa_pass' },
};

export const paymentWorker = new Worker<PaymentJob>(
  QUEUE_NAMES.PAYMENTS,
  async (job: Job<PaymentJob>) => {
    const { stripeSessionId, userId, productType } = job.data;
    console.log(`💳 Processing payment: ${productType} for user ${userId}`);

    const existing = await db.select().from(transactions)
      .where(eq(transactions.stripeSessionId, stripeSessionId)).limit(1);
    if (existing[0]?.status === 'completed') return;

    const grant = PRODUCT_GRANTS[productType];
    if (!grant) throw new Error(`Unknown product type: ${productType}`);

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error(`User not found: ${userId}`);

    const updates: any = { estrelas: user.estrelas + grant.estrelas };
    if (grant.item === 'boost') updates.boostsAvailable = user.boostsAvailable + 1;
    if (grant.item === 'shield') updates.shieldsAvailable = user.shieldsAvailable + 1;
    if (grant.item === 'copa_pass') {
      updates.hasCopaPass = true;
      updates.copaPassExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    await db.update(users).set(updates).where(eq(users.id, userId));
    await db.update(transactions)
      .set({ status: 'completed', estrelasGranted: grant.estrelas })
      .where(eq(transactions.stripeSessionId, stripeSessionId));

    await notificationsQueue.add('payment-confirmed', {
      type: 'payment_confirmed',
      userId,
      payload: { productName: productType, estrelasGranted: grant.estrelas },
    });

    console.log(`✅ Payment processed for user ${userId}`);
  },
  { connection: redisConnection, concurrency: 3 }
);

paymentWorker.on('failed', (job, err) => {
  console.error(`❌ payment job ${job?.id} failed:`, err.message);
});
