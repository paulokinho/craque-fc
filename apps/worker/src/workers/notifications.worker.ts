import { Worker, type Job } from 'bullmq';
import webpush from 'web-push';
import { redisConnection } from '../lib/redis';
import { db } from '../lib/db';
import { pushSubscriptions } from '../../../api/src/db/schema';
import { eq } from 'drizzle-orm';
import { QUEUE_NAMES } from '../queues';

type NotificationJob = {
  type: 'match_reminder' | 'result_scored' | 'prize_won' | 'payment_confirmed';
  userId?: string;
  payload: Record<string, unknown>;
};

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_EMAIL) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch {
    console.warn('VAPID keys not configured — push notifications disabled');
  }
}

export const notificationsWorker = new Worker<NotificationJob>(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job<NotificationJob>) => {
    const { type, userId, payload } = job.data;
    console.log(`📬 Processing notification: ${type} for ${userId || 'all'}`);

    const subs = userId
      ? await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId))
      : await db.select().from(pushSubscriptions);

    if (subs.length === 0) return;

    const notification = JSON.stringify({
      title: type === 'result_scored' ? 'Resultado calculado!' : 'Craque FC',
      body: JSON.stringify(payload),
    });

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification
        )
      )
    );

    console.log(`📬 Sent ${results.filter(r => r.status === 'fulfilled').length}/${subs.length} notifications`);
  },
  { connection: redisConnection, concurrency: 5, limiter: { max: 100, duration: 1000 } }
);

notificationsWorker.on('failed', (job, err) => {
  console.error(`❌ notifications job ${job?.id} failed:`, err.message);
});
