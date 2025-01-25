import cluster from 'cluster';
import os from 'os';
import app from './app';
import { redisClient } from './config/redis';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary process is running with ${numCPUs} CPUs`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new one.`);
    cluster.fork();
  });
} else {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  // Graceful Shutdown
  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      redisClient.quit();
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forcing shutdown');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
