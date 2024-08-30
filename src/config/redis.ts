// redisConfig.ts
import Redis from 'ioredis';
import dotenv from 'dotenv';
import RedisStore from 'connect-redis';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisStore = new RedisStore({
  client: redisClient,
  ttl: 86400, // 1 day session expiration
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export { redisClient, redisStore };
