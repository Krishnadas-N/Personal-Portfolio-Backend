import { Request, Response } from 'express';
import { redisClient, isRedisEnabled } from '../config/redis';
import { logger, collectSystemMetrics, healthCheck } from '../utils/logger';
import cluster from 'cluster';

// Metrics collection service
export class MetricsService {
  private static instance: MetricsService;
  private metricsInterval: NodeJS.Timeout | null = null;
  private flushInterval: NodeJS.Timeout | null = null;
  
  // Local aggregation buffers
  private localRequestCount: number = 0;
  private localErrorCount: number = 0;
  private localTotalResponseTime: number = 0;
  private localResponseCount: number = 0;
  private activeRequests: number = 0;

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

    // System metrics collection - ONLY in Primary or Single Process
    // Workers should not collect system metrics to avoid redundancy and overwriting
    if (cluster.isPrimary || !cluster.isWorker) {
        this.metricsInterval = setInterval(async () => {
        try {
            await collectSystemMetrics();
            // App metrics in primary might be limited if it doesn't handle requests
            if (!cluster.isPrimary) {
                 await this.collectApplicationMetrics();
            }
        } catch (error) {
            logger.error('Metrics collection failed', error);
        }
        }, intervalMs);
    }

    // Flush local metrics to Redis frequently (every 5 seconds) - RUNS EVERYWHERE
    if (this.flushInterval) {
        clearInterval(this.flushInterval);
    }
    this.flushInterval = setInterval(() => this.flushMetrics(), 5000);

    logger.info(`Metrics collection started in process ${process.pid}`, { interval: intervalMs });
  }

  // Stop metrics collection
  public stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    if (this.flushInterval) {
        clearInterval(this.flushInterval);
        this.flushInterval = null;
    }
    // Final flush
    this.flushMetrics().catch(e => logger.error('Final flush failed', e));
    logger.info('Metrics collection stopped');
  }

  private async flushMetrics(): Promise<void> {
    if (!isRedisEnabled || !redisClient) {
      this.localRequestCount = 0;
      this.localErrorCount = 0;
      this.localTotalResponseTime = 0;
      this.localResponseCount = 0;
      return;
    }

    if (this.localRequestCount === 0 && this.localErrorCount === 0 && this.localResponseCount === 0) {
        return;
    }

    const requestsToAdd = this.localRequestCount;
    const errorsToAdd = this.localErrorCount;
    const responseTimeToAdd = this.localTotalResponseTime;
    const responsesToAdd = this.localResponseCount;

    // Reset local counters immediately
    this.localRequestCount = 0;
    this.localErrorCount = 0;
    this.localTotalResponseTime = 0;
    this.localResponseCount = 0;

    try {
        const pipeline = redisClient.multi();
        if (requestsToAdd > 0) pipeline.incrBy('stats:total_requests', requestsToAdd);
        if (errorsToAdd > 0) pipeline.incrBy('stats:error_requests', errorsToAdd);
        await pipeline.exec();
        
        if (responsesToAdd > 0) {
            // Update average response time (simplified approximation)
            const currentAvgStr = await redisClient.get('stats:avg_response_time');
            const currentTotalReqStr = await redisClient.get('stats:total_requests'); 
            
            const currentAvg = parseFloat(currentAvgStr || '0');
            const currentCount = parseInt(currentTotalReqStr || '0') - requestsToAdd; 
            
            const oldTotalTime = currentAvg * currentCount;
            const newAverage = (oldTotalTime + responseTimeToAdd) / (currentCount + responsesToAdd);
            
            if (!isNaN(newAverage)) {
                await redisClient.set('stats:avg_response_time', newAverage.toString());
            }
        }
    } catch (error) {
        logger.error('Failed to flush metrics to Redis', error);
    }
  }

  // Collect application-specific metrics
  private async collectApplicationMetrics(): Promise<void> {
    if (!isRedisEnabled || !redisClient) {
      return;
    }

    try {
      const metrics = {
        timestamp: Date.now(),
        activeConnections: this.activeRequests, // Use local active requests
        cacheStats: await this.getCacheStats(),
        databaseStats: await this.getDatabaseStats(),
        requestStats: await this.getRequestStats()
      };

      // Note: If multiple workers run this, they overwrite. 
      // Ideally, workers should publish to a channel or list.
      // For now, we assume this runs mainly in non-clustered mode or we accept the race condition for "snapshot" stats.
      // But we disabled it in Primary, so only workers run it. 
      // If multiple workers, they still overwrite.
      // Let's use a process-specific key if clustered.
      const key = cluster.isWorker ? `app:metrics:${cluster.worker?.id}` : 'app:metrics';
      await redisClient.set(key, JSON.stringify(metrics), { EX: 300 });
    } catch (error) {
      logger.error('Failed to collect application metrics', error);
    }
  }

  // Get active connections count
  private async getActiveConnections(): Promise<number> {
    // This is now just returning local active requests
    return this.activeRequests;
  }

  // Get cache statistics
  private async getCacheStats(): Promise<any> {
    if (!isRedisEnabled || !redisClient) {
      return { enabled: false };
    }

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
      if (mongoose.connection.readyState === 1) {
        const stats = await mongoose.connection.db.stats();
        return {
            collections: stats.collections,
            dataSize: stats.dataSize,
            indexSize: stats.indexSize,
            storageSize: stats.storageSize
        };
      }
      return {};
    } catch (error) {
      logger.error('Failed to get database stats', error);
      return {};
    }
  }

  // Get request statistics
  private async getRequestStats(): Promise<any> {
    if (!isRedisEnabled || !redisClient) {
      return {
        totalRequests: this.localRequestCount,
        errorRequests: this.localErrorCount,
        avgResponseTime: 0
      };
    }

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

  // Increment request counter locally
  public incrementRequestCounter(): void {
    this.localRequestCount++;
    this.activeRequests++;
  }

  // Decrement active requests (called on finish)
  public decrementActiveRequests(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  // Increment error counter locally
  public incrementErrorCounter(): void {
    this.localErrorCount++;
  }

  // Update average response time locally
  public updateAvgResponseTime(responseTime: number): void {
    this.localTotalResponseTime += responseTime;
    this.localResponseCount++;
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
    if (!isRedisEnabled || !redisClient) {
      return;
    }

    try {
      const totalRequests = await redisClient.get('stats:total_requests') || '0';
      const errorRequests = await redisClient.get('stats:error_requests') || '0';
      
      if (parseInt(totalRequests) > 100) { // Minimum sample size
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
    if (!isRedisEnabled || !redisClient) {
      return;
    }

    try {
      const avgResponseTime = await redisClient.get('stats:avg_response_time') || '0';
      
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

    // Log alert even when Redis is unavailable
    logger.warn('Alert Triggered', { type, ...data });

    if (!isRedisEnabled || !redisClient) {
      return;
    }
    
    // Check if we already sent this alert recently (within 5 minutes)
    const lastAlert = await redisClient.get(`alert:${type}`);
    if (lastAlert) {
      const lastAlertTime = parseInt(lastAlert);
      if (Date.now() - lastAlertTime < 300000) { // 5 minutes
        return; // Don't send duplicate alerts
      }
    }

    // Store alert
    await redisClient.set(`alert:${type}`, Date.now().toString(), { EX: 300 });
    
    // Store alert in Redis for monitoring
    await redisClient.lPush('alerts', JSON.stringify({
      id: alertKey,
      type,
      data,
      timestamp: Date.now()
    }));
    
    // Keep only last 100 alerts
    await redisClient.lTrim('alerts', 0, 99);
  }

  // Get recent alerts
  public async getRecentAlerts(limit: number = 10): Promise<any[]> {
    if (!isRedisEnabled || !redisClient) {
      return [];
    }

    try {
    const alerts = await redisClient.lRange('alerts', 0, limit - 1) as string[];
    return alerts.map((alert: string) => JSON.parse(alert));
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
  
  // Increment request counter and active requests
  metricsService.incrementRequestCounter();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Decrement active requests
    metricsService.decrementActiveRequests();

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
      error: (error as Error).message
    });
  }
};

// Metrics endpoint
export const metricsEndpoint = async (req: Request, res: Response) => {
  try {
    if (!isRedisEnabled || !redisClient) {
      const systemMetrics = await collectSystemMetrics();
      return res.json({
        success: true,
        data: {
          system: systemMetrics,
          application: null,
          redis: 'disabled',
          timestamp: new Date().toISOString()
        }
      });
    }

    const systemMetrics = await redisClient.get('system:metrics');
    // Aggregate app metrics from all workers if needed, but for now just read basic one or current worker's
    // Since we split keys, we might need to scan or just return basic.
    // For simplicity, we'll try to get 'app:metrics' (from single mode) or just return what we have.
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
      error: (error as Error).message
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
      error: (error as Error).message
    });
  }
};

// Initialize monitoring
export const initializeMonitoring = () => {
  const metricsService = MetricsService.getInstance();
  const alertService = AlertService.getInstance();
  
  // Start metrics collection
  metricsService.startMetricsCollection(60000); // Every minute
  
  // Start alert checking - only in primary ideally, but service handles it
  if (cluster.isPrimary || !cluster.isWorker) {
      setInterval(() => {
        alertService.checkAlerts();
      }, 300000); // Every 5 minutes
  }
  
  // logger.info('Monitoring initialized'); // Already logged in startMetricsCollection
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
