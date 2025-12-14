// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { Application, RequestHandler } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import hpp from 'hpp';
import morgan from 'morgan';
import { redisClient } from './config/redis';
import { doubleCsrfProtection } from './services/csrfProtection';
import routes from './routes/index';
import securityMiddleware from './middlewares/security';
import { errorHandler, notFound } from './middlewares/errorHandler';
import connectToDatabase from './config/mongodb';
import { setupSwagger } from './config/swagger';
import { monitoringMiddleware, healthCheckEndpoint, metricsEndpoint, alertsEndpoint } from './services/monitoring';
import RedisStore from "connect-redis";
import config, { validateConfig } from './config/environment';
import analyticsMiddleware from './middlewares/analyticsMiddleware';
import CommunicationService from './services/communicationService';

// Validate configuration
validateConfig();

const app: Application = express();

// Connect to database
connectToDatabase();

// Initialize services
CommunicationService.initializeTransporter();

// Middleware setup
securityMiddleware(app);
app.use(cookieParser() as RequestHandler);
app.use(compression());

// Enhanced logging middleware
if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Analytics and tracking middleware
if (config.analytics.enabled) {
  app.use(analyticsMiddleware.trackPageAnalytics);
  app.use(analyticsMiddleware.trackPerformanceMetrics);
  app.use(analyticsMiddleware.trackSecurityMetrics);
  app.use(analyticsMiddleware.trackRateLimitMetrics);
  app.use(analyticsMiddleware.trackUserEngagement);
  app.use(analyticsMiddleware.detectBotTraffic);
  app.use(analyticsMiddleware.trackGeographicData);
}

// Session setup
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: config.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.server.nodeEnv === 'production',
      httpOnly: true,
      maxAge: config.auth.sessionMaxAge,
    },
  }) as RequestHandler
);

// CSRF protection
if (config.security.csrfEnabled) {
  app.use(doubleCsrfProtection);
}

// JSON and URL-encoded parsing with enhanced limits
app.use(express.json({ limit: config.upload.maxFileSize + 'b' }));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize + 'b' }));

// Monitoring middleware
app.use(monitoringMiddleware);

// Health check endpoint
app.get('/health', healthCheckEndpoint);

// Metrics endpoint
if (config.monitoring.metricsEnabled) {
  app.get(config.monitoring.metricsPath, metricsEndpoint);
}

// Alerts endpoint
app.get('/alerts', alertsEndpoint);

// Setup Swagger documentation
if (config.development.enableSwagger) {
  setupSwagger(app);
}

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

export default app;
