import cluster from 'cluster';
import os from 'os';
import app from './app';
import { redisClient } from './config/redis';
import { initializeMonitoring } from './services/monitoring';
import { logger } from './utils/logger';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  logger.info(`Primary process is running with ${numCPUs} CPUs`);

  // Initialize monitoring in primary process
  initializeMonitoring();

  for (let i = 0; i < numCPUs; i++) {
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
} else {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(`Worker ${process.pid} is running on port ${PORT}`);
  });

  // Graceful Shutdown for worker processes
  const shutdown = () => {
    logger.info(`Worker ${process.pid} shutting down gracefully...`);
    server.close(() => {
      redisClient.quit();
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
}
