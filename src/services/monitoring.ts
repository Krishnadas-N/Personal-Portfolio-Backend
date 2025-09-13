import { Request, Response } from 'express';
import { redisClient } from '../config/redis';
import { logger, collectSystemMetrics, healthCheck } from '../utils/logger';

// Metrics collection service
export class MetricsService {
  private static instance: MetricsService;
  private metricsInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  // Start metrics collection
  public startMetricsCollection(intervalMs: number = 60000): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(async () => {
      try {
        await collectSystemMetrics();
        await this.collectApplicationMetrics();
      } catch (error) {
        logger.error('Metrics collection failed', error);
      }
    }, intervalMs);

    logger.info('Metrics collection started', { interval: intervalMs });
  }

  // Stop metrics collection
  public stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
      logger.info('Metrics collection stopped');
    }
  }

  // Collect application-specific metrics
  private async collectApplicationMetrics(): Promise<void> {
    try {
      const metrics = {
        timestamp: Date.now(),
        activeConnections: await this.getActiveConnections(),
        cacheStats: await this.getCacheStats(),
        databaseStats: await this.getDatabaseStats(),
        requestStats: await this.getRequestStats()
      };

      await redisClient.setex('app:metrics', 300, JSON.stringify(metrics));
      logger.debug('Application metrics collected', metrics);
    } catch (error) {
      logger.error('Failed to collect application metrics', error);
    }
  }

  // Get active connections count
  private async getActiveConnections(): Promise<number> {
    try {
      const connections = await redisClient.get('app:connections');
      return connections ? parseInt(connections) : 0;
    } catch (error) {
      logger.error('Failed to get active connections', error);
      return 0;
    }
  }

  // Get cache statistics
  private async getCacheStats(): Promise<any> {
    try {
      const info = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');
      
      return {
        memory: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace)
      };
    } catch (error) {
      logger.error('Failed to get cache stats', error);
      return {};
    }
  }

  // Get database statistics
  private async getDatabaseStats(): Promise<any> {
    try {
      const mongoose = require('mongoose');
      const stats = await mongoose.connection.db.stats();
      
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        storageSize: stats.storageSize
      };
    } catch (error) {
      logger.error('Failed to get database stats', error);
      return {};
    }
  }

  // Get request statistics
  private async getRequestStats(): Promise<any> {
    try {
      const stats = {
        totalRequests: await redisClient.get('stats:total_requests') || 0,
        errorRequests: await redisClient.get('stats:error_requests') || 0,
        avgResponseTime: await redisClient.get('stats:avg_response_time') || 0
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get request stats', error);
      return {};
    }
  }

  // Parse Redis info output
  private parseRedisInfo(info: string): any {
    const result: any = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = isNaN(Number(value)) ? value : Number(value);
      }
    }
    
    return result;
  }

  // Increment request counter
  public async incrementRequestCounter(): Promise<void> {
    try {
      await redisClient.incr('stats:total_requests');
    } catch (error) {
      logger.error('Failed to increment request counter', error);
    }
  }

  // Increment error counter
  public async incrementErrorCounter(): Promise<void> {
    try {
      await redisClient.incr('stats:error_requests');
    } catch (error) {
      logger.error('Failed to increment error counter', error);
    }
  }

  // Update average response time
  public async updateAvgResponseTime(responseTime: number): Promise<void> {
    try {
      const current = await redisClient.get('stats:avg_response_time');
      const count = await redisClient.get('stats:total_requests');
      
      if (current && count) {
        const avg = (parseFloat(current) * parseInt(count) + responseTime) / (parseInt(count) + 1);
        await redisClient.set('stats:avg_response_time', avg.toString());
      } else {
        await redisClient.set('stats:avg_response_time', responseTime.toString());
      }
    } catch (error) {
      logger.error('Failed to update average response time', error);
    }
  }
}

// Alert service
export class AlertService {
  private static instance: AlertService;
  private alerts: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  // Check for alerts
  public async checkAlerts(): Promise<void> {
    try {
      await this.checkMemoryUsage();
      await this.checkErrorRate();
      await this.checkResponseTime();
      await this.checkDatabaseConnections();
    } catch (error) {
      logger.error('Alert check failed', error);
    }
  }

  // Check memory usage
  private async checkMemoryUsage(): Promise<void> {
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    
    if (memUsageMB > 1000) { // More than 1GB
      await this.sendAlert('high_memory_usage', {
        message: 'High memory usage detected',
        memoryUsage: `${memUsageMB.toFixed(2)}MB`,
        threshold: '1000MB'
      });
    }
  }

  // Check error rate
  private async checkErrorRate(): Promise<void> {
    try {
      const totalRequests = await redisClient.get('stats:total_requests') || 0;
      const errorRequests = await redisClient.get('stats:error_requests') || 0;
      
      if (parseInt(totalRequests) > 0) {
        const errorRate = (parseInt(errorRequests) / parseInt(totalRequests)) * 100;
        
        if (errorRate > 5) { // More than 5% error rate
          await this.sendAlert('high_error_rate', {
            message: 'High error rate detected',
            errorRate: `${errorRate.toFixed(2)}%`,
            threshold: '5%'
          });
        }
      }
    } catch (error) {
      logger.error('Failed to check error rate', error);
    }
  }

  // Check response time
  private async checkResponseTime(): Promise<void> {
    try {
      const avgResponseTime = await redisClient.get('stats:avg_response_time') || 0;
      
      if (parseFloat(avgResponseTime) > 2000) { // More than 2 seconds
        await this.sendAlert('slow_response_time', {
          message: 'Slow response time detected',
          avgResponseTime: `${parseFloat(avgResponseTime).toFixed(2)}ms`,
          threshold: '2000ms'
        });
      }
    } catch (error) {
      logger.error('Failed to check response time', error);
    }
  }

  // Check database connections
  private async checkDatabaseConnections(): Promise<void> {
    try {
      const mongoose = require('mongoose');
      const readyState = mongoose.connection.readyState;
      
      if (readyState !== 1) { // Not connected
        await this.sendAlert('database_connection_lost', {
          message: 'Database connection lost',
          readyState,
          expectedState: 1
        });
      }
    } catch (error) {
      logger.error('Failed to check database connections', error);
    }
  }

  // Send alert
  private async sendAlert(type: string, data: any): Promise<void> {
    const alertKey = `${type}_${Date.now()}`;
    
    // Check if we already sent this alert recently (within 5 minutes)
    const lastAlert = await redisClient.get(`alert:${type}`);
    if (lastAlert) {
      const lastAlertTime = parseInt(lastAlert);
      if (Date.now() - lastAlertTime < 300000) { // 5 minutes
        return; // Don't send duplicate alerts
      }
    }

    // Store alert
    await redisClient.setex(`alert:${type}`, 300, Date.now().toString());
    
    // Log alert
    logger.warn('Alert Triggered', { type, ...data });
    
    // Store alert in Redis for monitoring
    await redisClient.lpush('alerts', JSON.stringify({
      id: alertKey,
      type,
      data,
      timestamp: Date.now()
    }));
    
    // Keep only last 100 alerts
    await redisClient.ltrim('alerts', 0, 99);
  }

  // Get recent alerts
  public async getRecentAlerts(limit: number = 10): Promise<any[]> {
    try {
      const alerts = await redisClient.lrange('alerts', 0, limit - 1);
      return alerts.map(alert => JSON.parse(alert));
    } catch (error) {
      logger.error('Failed to get recent alerts', error);
      return [];
    }
  }
}

// Monitoring middleware
export const monitoringMiddleware = (req: Request, res: Response, next: any) => {
  const start = Date.now();
  const metricsService = MetricsService.getInstance();
  
  // Increment request counter
  metricsService.incrementRequestCounter();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Update average response time
    metricsService.updateAvgResponseTime(duration);
    
    // Increment error counter if status >= 400
    if (res.statusCode >= 400) {
      metricsService.incrementErrorCounter();
    }
  });
  
  next();
};

// Health check endpoint
export const healthCheckEndpoint = async (req: Request, res: Response) => {
  try {
    const health = await healthCheck();
    const statusCode = health.healthy ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.healthy,
      ...health
    });
  } catch (error) {
    logger.error('Health check endpoint failed', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};

// Metrics endpoint
export const metricsEndpoint = async (req: Request, res: Response) => {
  try {
    const systemMetrics = await redisClient.get('system:metrics');
    const appMetrics = await redisClient.get('app:metrics');
    
    res.json({
      success: true,
      data: {
        system: systemMetrics ? JSON.parse(systemMetrics) : null,
        application: appMetrics ? JSON.parse(appMetrics) : null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Metrics endpoint failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve metrics',
      error: error.message
    });
  }
};

// Alerts endpoint
export const alertsEndpoint = async (req: Request, res: Response) => {
  try {
    const alertService = AlertService.getInstance();
    const alerts = await alertService.getRecentAlerts(50);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Alerts endpoint failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alerts',
      error: error.message
    });
  }
};

// Initialize monitoring
export const initializeMonitoring = () => {
  const metricsService = MetricsService.getInstance();
  const alertService = AlertService.getInstance();
  
  // Start metrics collection
  metricsService.startMetricsCollection(60000); // Every minute
  
  // Start alert checking
  setInterval(() => {
    alertService.checkAlerts();
  }, 300000); // Every 5 minutes
  
  logger.info('Monitoring initialized');
};

export default {
  MetricsService,
  AlertService,
  monitoringMiddleware,
  healthCheckEndpoint,
  metricsEndpoint,
  alertsEndpoint,
  initializeMonitoring
};
