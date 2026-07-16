// MUST load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import cluster from 'cluster';
import os from 'os';
import { logger } from './utils/logger';

const isClusteringEnabled = process.env.ENABLE_CLUSTERING === 'true';
const requestedWorkers = parseInt(
  process.env.CLUSTER_WORKERS || process.env.WEB_CONCURRENCY || '1',
  10
);
const workerCount = Number.isNaN(requestedWorkers)
  ? 1
  : Math.max(1, Math.min(os.cpus().length, requestedWorkers));

const startWorker = async () => {
  const [{ default: app }, { quitRedis }, { initializeMonitoring }] = await Promise.all([
    import('./app'),
    import('./config/redis'),
    import('./services/monitoring')
  ]);

  if (process.env.MONITORING_ENABLED !== 'false') {
    initializeMonitoring();
  }

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(`Worker ${process.pid} is running on port ${PORT}`);
  });

  // Graceful shutdown for worker processes
  const shutdown = () => {
    logger.info(`Worker ${process.pid} shutting down gracefully...`);
    server.close(async () => {
      await quitRedis();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error(`Worker ${process.pid} forcing shutdown`);
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('uncaughtException', (error) => {
    logger.error(`Worker ${process.pid} uncaught exception`, error);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Worker ${process.pid} unhandled rejection`, { reason, promise });
    process.exit(1);
  });
};

const start = async () => {
  if (isClusteringEnabled && cluster.isPrimary) {
    logger.info(`Primary process is running with ${workerCount} worker(s)`);

    for (let i = 0; i < workerCount; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker) => {
      logger.warn(`Worker ${worker.process.pid} died. Forking a new one.`);
      cluster.fork();
    });

    // Graceful shutdown for primary process
    const shutdown = () => {
      logger.info('Shutting down primary process...');
      Object.values(cluster.workers || {}).forEach(worker => {
        worker?.kill();
      });
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    return;
  }

  try {
    await startWorker();
  } catch (error) {
    logger.error('Failed to start server process', error);
    process.exit(1);
  }
};

start();
