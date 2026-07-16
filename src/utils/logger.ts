import { Request, Response, NextFunction } from 'express';
import { redisClient, isRedisEnabled } from '../config/redis';

// Logger interface
interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

import fs from 'fs';
import path from 'path';

const fileLoggingEnabled = process.env.LOG_FILE === 'true';
const maxLogSizeBytes = parseInt(process.env.MAX_LOG_SIZE_BYTES || `${2 * 1024 * 1024}`, 10);
const maxLogFiles = parseInt(process.env.MAX_LOG_FILES || '3', 10);
const maxMetaLength = parseInt(process.env.LOG_META_MAX_LENGTH || '4000', 10);

// Ensure logs directory exists only when file logging is enabled
const logDir = path.join(process.cwd(), 'logs');
if (fileLoggingEnabled && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFilePath = path.join(logDir, 'app.log');

// Simple logger implementation
class SimpleLogger implements Logger {
  private stringifyMeta(meta: any): string {
    if (!meta) return '';

    try {
      const serialized = JSON.stringify(meta);
      if (serialized.length > maxMetaLength) {
        return ` ${serialized.slice(0, maxMetaLength)}...[truncated]`;
      }
      return ` ${serialized}`;
    } catch {
      return ' [unserializable meta]';
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = this.stringifyMeta(meta);
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  private checkLogRotation(): void {
    try {
      if (!fileLoggingEnabled) return;
      if (!fs.existsSync(logFilePath)) return;

      const stats = fs.statSync(logFilePath);
      if (stats.size < maxLogSizeBytes) return;

      // Rename current file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(logDir, `app-${timestamp}.log`);
      fs.renameSync(logFilePath, backupPath);

      // Clean up old files (keep last 5)
      const files = fs.readdirSync(logDir);
      const logFiles = files.filter(f => f.startsWith('app-') && f.endsWith('.log'));

      if (logFiles.length > maxLogFiles) {
        // Sort by creation time (stat) to find oldest
        const fileStats = logFiles.map(f => ({
          name: f,
          time: fs.statSync(path.join(logDir, f)).mtime.getTime()
        }));

        fileStats.sort((a, b) => a.time - b.time); // Oldest first

        // Delete oldest until we have maxLogFiles left
        const deleteCount = logFiles.length - maxLogFiles;
        for (let i = 0; i < deleteCount; i++) {
          fs.unlinkSync(path.join(logDir, fileStats[i].name));
        }
      }
    } catch (err) {
      console.error('Log rotation failed', err);
    }
  }

  private writeToFile(message: string): void {
    if (!fileLoggingEnabled) return;

    try {
      this.checkLogRotation();
      fs.appendFileSync(logFilePath, message + '\n');
    } catch (err) {
      console.error('Failed to write to log file', err);
    }
  }

  info(message: string, meta?: any): void {
    const formatted = this.formatMessage('info', message, meta);
    console.log(formatted);
    this.writeToFile(formatted);
  }

  error(message: string, meta?: any): void {
    const formatted = this.formatMessage('error', message, meta);
    console.error(formatted);
    this.writeToFile(formatted);
  }

  warn(message: string, meta?: any): void {
    const formatted = this.formatMessage('warn', message, meta);
    console.warn(formatted);
    this.writeToFile(formatted);
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, meta);
      console.debug(formatted);
      this.writeToFile(formatted);
    }
  }
}

export const logger = new SimpleLogger();

export const getLogs = async (limit: number = 100): Promise<string[]> => {
  try {
    if (!fs.existsSync(logFilePath)) {
      return [];
    }

    const data = await fs.promises.readFile(logFilePath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines.slice(-limit).reverse();
  } catch (error) {
    console.error('Failed to read logs', error);
    return [];
  }
};


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

    // Store performance metrics in Redis (optional)
    if (process.env.ENABLE_MONITORING === 'true' && isRedisEnabled && redisClient) {
      const key = `perf:${req.method}:${req.url}`;
      redisClient.lPush(key, JSON.stringify({
        duration,
        timestamp: Date.now(),
        status: res.statusCode
      })).catch(() => undefined);

      // Keep only last 100 entries
      redisClient.lTrim(key, 0, 99).catch(() => undefined);
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

  // Store in Redis for monitoring (optional)
  if (process.env.ENABLE_MONITORING === 'true' && isRedisEnabled && redisClient) {
    await redisClient.set('system:metrics', JSON.stringify(metrics), { EX: 300 });
  }

  return metrics;
};

// Health check utilities — Redis is optional and never fails the overall check
export const healthCheck = async () => {
  const checks: {
    database: boolean;
    memory: boolean;
    redis: boolean | 'disabled';
    uptime: number;
  } = {
    database: false,
    memory: false,
    redis: isRedisEnabled ? false : 'disabled',
    uptime: process.uptime()
  };

  try {
    // Check MongoDB connection
    const mongoose = require('mongoose');
    checks.database = mongoose.connection.readyState === 1;
  } catch (error) {
    logger.error('Database health check failed', error);
  }

  if (isRedisEnabled && redisClient) {
    try {
      const ping = await redisClient.ping();
      checks.redis = ping === 'PONG';
    } catch (error) {
      checks.redis = false;
      logger.warn('Redis health check failed (non-critical)', error);
    }
  }

  try {
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    checks.memory = memUsageMB < 1000; // Less than 1GB
  } catch (error) {
    logger.error('Memory health check failed', error);
  }

  // Only database + memory are required for a healthy service
  const isHealthy = checks.database && checks.memory;

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
  if (!isRedisEnabled || !redisClient) {
    return true;
  }

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
  if (!isRedisEnabled || !redisClient) {
    return null;
  }

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get failed', { key, error });
    return null;
  }
};

export const setCachedData = async (key: string, data: any, ttl: number = 3600): Promise<void> => {
  if (!isRedisEnabled || !redisClient) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  } catch (error) {
    logger.error('Cache set failed', { key, error });
  }
};

export const deleteCachedData = async (pattern: string): Promise<void> => {
  if (!isRedisEnabled || !redisClient) {
    return;
  }

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
