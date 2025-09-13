import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

// Cache middleware
export const cache = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      // Try to get cached data
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data: any) {
        // Cache the response
        redisClient.setex(key, duration, JSON.stringify(data));
        
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
      // Invalidate cache after successful operations
      const originalJson = res.json;
      
      res.json = function(data: any) {
        // Only invalidate on successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.keys(`cache:${pattern}`).then((keys) => {
            if (keys.length > 0) {
              redisClient.del(keys);
            }
          });
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
  projects: 'cache:/api/projects*',
  blogs: 'cache:/api/blogs*',
  skills: 'cache:/api/skills*',
  experiences: 'cache:/api/experiences*',
  education: 'cache:/api/education*',
  certifications: 'cache:/api/certifications*',
  testimonials: 'cache:/api/testimonials*',
  profile: 'cache:/api/profile*',
};

// Cache duration constants
export const cacheDurations = {
  short: 300,    // 5 minutes
  medium: 900,   // 15 minutes
  long: 3600,    // 1 hour
  veryLong: 86400, // 24 hours
};
