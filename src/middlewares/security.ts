import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss";
import csurf from "csurf";
import compression from "compression";
import cors from "cors";
import hpp from "hpp";

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
  if (isSanitizable(req.body)) sanitizeObject(req.body);
  if (isSanitizable(req.query)) sanitizeObject(req.query);
  if (isSanitizable(req.params)) sanitizeObject(req.params);
  next();
};

const securityMiddleware = (app: express.Application) => {
  // Security headers
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  });
  app.use(limiter);

  // CSRF Protection
  app.use(csurf({ cookie: true }));

  // XSS Protection Middleware
  app.use(xssSanitizer);

  // CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.CLIENT_URL as string];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Compression
  app.use(compression());
  app.use(hpp());
  // Add more middleware as needed
};

export default securityMiddleware;
