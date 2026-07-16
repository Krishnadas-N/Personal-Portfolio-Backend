import { Request, Response, NextFunction } from 'express';
import { redisClient, isRedisEnabled } from '../config/redis';
import config from '../config/environment';

// Cache middleware
export const cache = (duration: number = config.cache.shortTtl) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET' || !isRedisEnabled || !redisClient) {
      return next();
    }

    const client = redisClient;
    const key = `cache:${req.originalUrl}`;

    try {
      // Try to get cached data
      const cachedData = await client.get(key);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function (data: any) {
        // Cache the response
        // Use v4 syntax: set(key, value, { EX: duration })
        client.set(key, JSON.stringify(data), { EX: duration })
          .catch(err => console.error('Redis Cache Error', err));

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isRedisEnabled || !redisClient) return next();

      const client = redisClient;

      // Invalidate cache after successful operations
      const originalJson = res.json;

      res.json = function (data: any) {
        // Only invalidate on successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Use scanIterator to find keys avoiding blocking and type errors
          (async () => {
            try {
              const matchPattern = `cache:${pattern}*`;
              const keysToDelete: string[] = [];

              // Collect keys first
              for await (const key of client.scanIterator({ MATCH: matchPattern, COUNT: 100 })) {
                const keyStr = Array.isArray(key) ? key[0] : key;
                keysToDelete.push(String(keyStr));
                // Delete in batches of 50 to avoid large payloads
                if (keysToDelete.length >= 50) {
                  await client.del(keysToDelete);
                  keysToDelete.length = 0;
                }
              }

              // Delete remaining
              if (keysToDelete.length > 0) {
                await client.del(keysToDelete);
              }
            } catch (e) {
              console.error('Cache invalidation failed', e);
            }
          })();
        }

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache invalidation error:', error);
      next();
    }
  };
};

// Specific cache patterns
export const cachePatterns = {
  projects: '/api/projects',
  blogs: '/api/blogs',
  skills: '/api/skills',
  experiences: '/api/experiences',
  education: '/api/education',
  certifications: '/api/certifications',
  testimonials: '/api/testimonials',
  profile: '/api/profile',
};

// Cache duration constants - map to actual config property names
export const cacheDurations = {
  short: config.cache.shortTtl,
  medium: 900, // 15 minutes
  long: config.cache.longTtl,
  veryLong: config.cache.veryLongTtl,
  default: config.cache.defaultTtl
};
