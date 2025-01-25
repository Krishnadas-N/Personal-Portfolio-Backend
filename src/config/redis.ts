import {createClient} from 'redis';
import session from 'express-session';

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD as string,
  socket: {
      host: process.env.REDIS_URL as string,
      port: parseInt(process.env.REDIS_PORT as string)
  }
});
redisClient.on('error', (err) => console.error('Redis error:', err));

export { redisClient };

