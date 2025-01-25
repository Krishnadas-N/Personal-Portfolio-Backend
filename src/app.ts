import express, { Application,RequestHandler } from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import hpp from 'hpp';
import { redisClient } from './config/redis';
import { doubleCsrfProtection } from './services/csrfProtection';
// import routes from './routes/index';
import securityMiddleware from './middlewares/security';
import RedisStore from "connect-redis";

dotenv.config();

const app: Application = express();

// Middleware setup
securityMiddleware(app);
app.use(cookieParser()  as RequestHandler);
app.use(compression());

// Session setup
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60000,
    },
  })  as RequestHandler
);

// CSRF protection
// app.use(doubleCsrfProtection);

// JSON and URL-encoded parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api', routes);

export default app;
