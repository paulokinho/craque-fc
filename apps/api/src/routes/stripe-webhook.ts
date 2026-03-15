import { Elysia } from 'elysia';
import Stripe from 'stripe';
import { paymentsQueue } from '../lib/queue';

export const stripeWebhookRoutes = new Elysia({ prefix: '/webhooks' })
  .post('/stripe', async ({ request, headers }) => {
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const sig = headers['stripe-signature'];
    const body = await request.text();

    let event: Stripe.Event;
    try {
      event = stripeClient.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      throw new Error('Webhook signature invalid');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await paymentsQueue.add('payment-complete' as any, {
        stripeSessionId: session.id,
        userId: session.metadata?.userId ?? '',
        productType: session.metadata?.productType ?? '',
      }, {
        jobId: `payment-${session.id}`,
      });
    }

    return { received: true };
  });
