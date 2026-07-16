import { createClient, RedisClientType } from 'redis';
import config from './environment';

export const isRedisEnabled = config.cache.redisEnabled;

let redisClient: RedisClientType | null = null;

if (isRedisEnabled) {
  const redisUrl = config.database.redisUri;
  const isRedisCloud = redisUrl.startsWith('rediss://');

  redisClient = createClient({
    url: redisUrl,
    socket: {
      tls: isRedisCloud || undefined,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis: Max connection retries reached, giving up.');
          return false;
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('Redis Client Connected'));
  redisClient.on('ready', () => console.log('Redis Client Ready'));

  (async () => {
    try {
      await redisClient!.connect();
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
    }
  })();
} else {
  console.log('Redis is disabled. Set REDIS_ENABLED=true to enable caching/sessions via Redis.');
}

export { redisClient };

export const quitRedis = async (): Promise<void> => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
};
