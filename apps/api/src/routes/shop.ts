import { Elysia, t } from 'elysia';
import { db } from '../db/client';
import { transactions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const SHOP_ITEMS = [
  { id: 'estrelas_100', name: 'Pacote Estrelas', description: '100 Estrelas', priceCents: 199, currency: 'brl' },
  { id: 'estrelas_500', name: 'Pacote Craque', description: '500 Estrelas — melhor custo-benefício', priceCents: 799, currency: 'brl' },
  { id: 'boost_x2', name: 'Boost x2', description: 'Dobra seus pontos no próximo palpite', priceCents: 199, currency: 'brl' },
  { id: 'streak_shield', name: 'Escudo da Sequência', description: 'Protege sua sequência de acertos', priceCents: 99, currency: 'brl' },
  { id: 'copa_pass_month', name: 'Copa Pass', description: '1 mês — palpites extras + bônus exclusivos', priceCents: 990, currency: 'brl' },
];

export const shopRoutes = new Elysia({ prefix: '/shop' })
  .get('/items', () => SHOP_ITEMS)
  .use(authMiddleware)
  .post('/checkout', async (ctx) => {
    const userId = (ctx as any).userId as string;
    const { body } = ctx;
    const item = SHOP_ITEMS.find(i => i.id === body.productType);
    if (!item) throw new Error('Produto não encontrado');

    const [tx] = await db.insert(transactions).values({
      userId,
      productType: body.productType,
      amountBrl: (item.priceCents / 100).toFixed(2),
      status: 'pending',
    }).returning();

    return { transactionId: tx.id, item };
  }, {
    body: t.Object({ productType: t.String() }),
  });
