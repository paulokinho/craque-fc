import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';

export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
  .use(cookie())
  .derive({ as: 'scoped' }, async ({ jwt, cookie: { auth }, set }) => {
    const payload = await jwt.verify(auth?.value as string | undefined);
    if (!payload) {
      set.status = 401;
      throw new Error('Não autenticado');
    }
    return { userId: (payload as any).userId as string };
  });
