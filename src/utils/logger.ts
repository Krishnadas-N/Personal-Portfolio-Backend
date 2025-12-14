import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

// Logger interface
interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// Simple logger implementation
class SimpleLogger implements Logger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new SimpleLogger();

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Error logging middleware
export const errorLogger = (error: any, req: Request, res: Response, next: NextFunction) => {
  const logData = {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params
  };

  logger.error('Application Error', logData);
  next(error);
};

// Performance monitoring
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    // Log slow requests
    if (duration > 1000) { // More than 1 second
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        status: res.statusCode
      });
    }

    // Store performance metrics in Redis
    if (process.env.ENABLE_MONITORING === 'true') {
      const key = `perf:${req.method}:${req.url}`;
      redisClient.lpush(key, JSON.stringify({
        duration,
        timestamp: Date.now(),
        status: res.statusCode
      }));
      
      // Keep only last 100 entries
      redisClient.ltrim(key, 0, 99);
    }
  });

  next();
};

// System metrics collector
export const collectSystemMetrics = async () => {
  const metrics = {
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    cpu: process.cpuUsage(),
    pid: process.pid,
    platform: process.platform,
    nodeVersion: process.version
  };

  logger.info('System Metrics', metrics);
  
  // Store in Redis for monitoring
  if (process.env.ENABLE_MONITORING === 'true') {
    await redisClient.set('system:metrics', JSON.stringify(metrics), { EX: 300 });
  }

  return metrics;
};

// Health check utilities
export const healthCheck = async () => {
  const checks = {
    database: false,
    redis: false,
    memory: false,
    uptime: process.uptime()
  };

  try {
    // Check MongoDB connection
    const mongoose = require('mongoose');
    checks.database = mongoose.connection.readyState === 1;
  } catch (error) {
    logger.error('Database health check failed', error);
  }

  try {
    // Check Redis connection
    const ping = await redisClient.ping();
    checks.redis = ping === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed', error);
  }

  try {
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    checks.memory = memUsageMB < 1000; // Less than 1GB
  } catch (error) {
    logger.error('Memory health check failed', error);
  }

  const isHealthy = Object.values(checks).every(check => 
    typeof check === 'boolean' ? check : true
  );

  return {
    healthy: isHealthy,
    checks,
    timestamp: new Date().toISOString()
  };
};

// Rate limiting utilities
export const rateLimitKey = (req: Request): string => {
  return `rate_limit:${req.ip}:${req.path}`;
};

export const checkRateLimit = async (key: string, limit: number, windowMs: number): Promise<boolean> => {
  try {
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
    }
    
    return current <= limit;
  } catch (error) {
    logger.error('Rate limit check failed', error);
    return true; // Allow request if rate limiting fails
  }
};

// Cache utilities
export const cacheKey = (prefix: string, ...parts: string[]): string => {
  return `${prefix}:${parts.join(':')}`;
};

export const getCachedData = async (key: string): Promise<any> => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get failed', { key, error });
    return null;
  }
};

export const setCachedData = async (key: string, data: any, ttl: number = 3600): Promise<void> => {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  } catch (error) {
    logger.error('Cache set failed', { key, error });
  }
};

export const deleteCachedData = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error('Cache delete failed', { pattern, error });
  }
};

// Utility functions
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000); // Limit length
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Export all utilities
export default {
  logger,
  requestLogger,
  errorLogger,
  performanceMonitor,
  collectSystemMetrics,
  healthCheck,
  rateLimitKey,
  checkRateLimit,
  cacheKey,
  getCachedData,
  setCachedData,
  deleteCachedData,
  generateSlug,
  sanitizeInput,
  isValidEmail,
  isValidUrl,
  formatDate,
  calculateReadingTime
};
