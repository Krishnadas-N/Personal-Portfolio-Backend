import express, { Request, Response, NextFunction } from 'express';
import hpp from 'hpp';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import csurf from 'csurf';
import session from 'express-session';
import cluster from 'cluster';
import os from 'os';
import path from 'path';
import fs from 'fs';
import securityMiddleware from './middlewares/security';
import { redisClient,redisStore } from './config/redis';
import connectToDatabase from './config/mongodb';
// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

// Apply security middleware
securityMiddleware(app);

// Middleware: Prevent parameter pollution
app.use(hpp());

// Middleware: Logging with Morgan (logs requests to access.log)
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Middleware: Parsing cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// Middleware: Session management with Redis for fast and scalable session storage
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60000, // 1 minute for demo purposes
    },
  })
);

// Middleware: Compress responses to improve performance
app.use(compression());

// Middleware: CSRF protection to prevent cross-site request forgery attacks
app.use(csurf({ cookie: true }));

// Middleware: JSON and URL-encoded body parsing
app.use(express.json({ limit: '10kb' })); // Limit body size for security
app.use(express.urlencoded({ extended: true }));

connectToDatabase()
// Middleware: Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});



/// Cluster setup for performance improvement using all available CPU cores
if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`Primary process is running with ${numCPUs} CPUs`);
  
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died. Forking a new one.`);
      cluster.fork();
    });
  } else {
    // Start the server only if not in primary process
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  
    // Graceful Shutdown
    const shutdown = () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Closed out remaining connections');
        redisClient.quit();
        process.exit(0);
      });
  
      setTimeout(() => {
        console.error('Forcing shutdown');
        process.exit(1);
      }, 10000);
  
      // If any connections are open, force shutdown
      server.on('connection', (conn) => conn.end());
    };
  
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }