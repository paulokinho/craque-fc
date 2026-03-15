import IORedis from 'ioredis';

export const redisConnection: any = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('connect', () => console.log('✅ Worker connected to Dragonfly'));
redisConnection.on('error', (err: any) => console.error('❌ Dragonfly error:', err));
