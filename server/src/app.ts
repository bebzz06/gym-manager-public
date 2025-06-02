import './instrument.js';
import express, { Express } from 'express';
import cors from 'cors';
import v1Routes from '@routes/v1/index.js';
import config from '@/config/index.js';
import connectDB from '@/config/db.js';
import initializeFirebase from '@/config/firebase.js';
import cookieParser from 'cookie-parser';
import { initializePaymentJobs, initializeSubscriptionJobs } from './jobs/index.js';
import initializePassport from '@/config/passport.js';
import { Sentry } from '@/instrument.js';
import { logger } from '@/utils/index.js';

const initializeApp = async () => {
  const app: Express = express();
  const passport = initializePassport();
  // Middleware
  app.use(
    cors({
      origin: config.server.clientUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Firebase
    await initializeFirebase();

    // Initialize payment and subscription jobs
    await initializePaymentJobs();
    await initializeSubscriptionJobs();
    // Routes
    const API_VERSION = `${config.api.version}`;
    app.use(API_VERSION, v1Routes);

    if (config.sentry.enabled) {
      app.use(Sentry.expressErrorHandler());
    }
    app.use((err: any, req: any, res: any, next: any) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({
        message: 'Internal server error',
        error: err,
      });
    });
    const HOST = config.server.host;
    const PORT = config.server.port;
    app.listen(PORT, HOST, () => {
      logger.info(`SERVER RUNNING on ${HOST}:${PORT}`);
    });

    return app;
  } catch (error) {
    logger.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();

export default initializeApp;
