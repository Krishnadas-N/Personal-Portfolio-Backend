import { createClient } from 'redis';
import config from './environment';
import { logger } from '../utils/logger';

// Parse Redis URL to handle Redis Cloud properly
const redisUrl = config.database.redisUri;
const isRedisCloud = redisUrl.startsWith('rediss://'); // Redis Cloud uses TLS

const redisClient = createClient({
  url: redisUrl,
  socket: {
    // Enable TLS for Redis Cloud
    tls: isRedisCloud,
    // Reconnect strategy
    reconnectStrategy: (retries) => {
      if (retries > 20) {
        logger.error('Redis: Max connection retries reached, giving up.');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 50, 1000);
    }
  }
});

redisClient.on('error', (err) => logger.error('Redis Client Error:', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));
redisClient.on('ready', () => logger.info('Redis Client Ready'));

// Connect immediately
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error('Failed to connect to Redis:', err);
  }
})();

export { redisClient };
