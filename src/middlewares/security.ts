import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss";
import compression from "compression";
import cors from "cors";
import hpp from "hpp";
import config from "../config/environment";

type Sanitizable = { [key: string]: string | Sanitizable };

const isSanitizable = (obj: any): obj is Sanitizable => {
  return obj && typeof obj === "object" && !Array.isArray(obj);
};

const sanitizeObject = (obj: Sanitizable): void => {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]) as string;
    } else if (isSanitizable(obj[key])) {
      sanitizeObject(obj[key]);
    }
  }
};

const xssSanitizer = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (config.security.xssProtection) {
    if (isSanitizable(req.body)) sanitizeObject(req.body);
    if (isSanitizable(req.query)) sanitizeObject(req.query);
    if (isSanitizable(req.params)) sanitizeObject(req.params);
  }
  next();
};

const securityMiddleware = (app: express.Application) => {
  // Security headers
  if (config.security.helmetEnabled) {
    app.use(helmet());
  }

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use(limiter);

  // XSS Protection Middleware
  app.use(xssSanitizer);

  // CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = config.security.corsOrigins;
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || config.server.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Compression
  app.use(compression());
  
  if (config.security.hppEnabled) {
    app.use(hpp());
  }
};

export default securityMiddleware;
