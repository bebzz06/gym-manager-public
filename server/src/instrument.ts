import * as Sentry from '@sentry/node';
// import { nodeProfilingIntegration } from '@sentry/profiling-node';
import config from '@/config/index.js';
if (config.sentry.enabled) {
  Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: config.env === 'production' ? 0.01 : 0.1,
    profilesSampleRate: 0, // Disabled - not available on free tier

    integrations: [
      // nodeProfilingIntegration(),
      Sentry.expressIntegration(),
      Sentry.httpIntegration(),
      Sentry.mongoIntegration(),
    ],
    environment: config.env,
    debug: config.env === 'development',

    sendDefaultPii: false,

    beforeSend(event, hint) {
      if (config.env === 'development') {
        console.log('Sentry event:', event);
        return null; // Don't send dev errors to save quota
      }

      if (event.exception) {
        const error = event.exception.values?.[0];
        const errorMessage = error?.value || '';
        const errorType = error?.type || '';

        // Filter out expected business logic and user errors
        if (
          // Mongoose validation errors
          errorType === 'ValidationError' ||
          // Network/connection errors
          errorMessage.includes('ECONNRESET') ||
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('ETIMEDOUT') ||
          errorMessage.includes('Network Error') ||
          // Authentication/Authorization (expected)
          errorMessage.includes('Invalid credentials') ||
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('Forbidden') ||
          errorMessage.includes('JWT expired') ||
          errorMessage.includes('Invalid refresh token') ||
          errorMessage.includes('Account requires password setup') ||
          // User input validation errors
          errorMessage.includes('Please provide all required fields') ||
          errorMessage.includes('Email already registered') ||
          errorMessage.includes('Email already in use') ||
          errorMessage.includes('Password must be at least') ||
          errorMessage.includes('Passwords do not match') ||
          errorMessage.includes('Invalid membership category') ||
          errorMessage.includes('Price amount cannot be negative') ||
          // Business rule violations (expected)
          errorMessage.includes('A gym can only have one owner') ||
          errorMessage.includes('Guardian information is required') ||
          errorMessage.includes('You already have an active membership plan') ||
          errorMessage.includes('membership plan with this name already exists') ||
          // File upload errors (user errors)
          errorMessage.includes('File too large') ||
          errorMessage.includes('Only image files are allowed') ||
          errorMessage.includes('Error optimizing image') ||
          // Payment errors (user-related)
          errorMessage.includes('Invalid item type') ||
          errorMessage.includes('Purchased item not found') ||
          errorMessage.includes('Invalid payment method') ||
          errorMessage.includes('not properly configured') ||
          // Rate limiting (expected)
          errorType === 'TooManyRequestsError' ||
          errorMessage.includes('Too many requests')
        ) {
          return null; // Don't send to Sentry
        }
      }

      return event;
    },

    tracesSampler: samplingContext => {
      const url = samplingContext.request?.url;
      if (
        url?.includes('/health') ||
        url?.includes('/metrics') ||
        url?.includes('/favicon.ico') ||
        url?.includes('/robots.txt')
      ) {
        return 0;
      }

      if (config.env === 'production') {
        if (url?.includes('/auth') || url?.includes('/payment')) {
          return 0.05; // 5% sampling for critical endpoints
        }
        return 0.001; // 0.1% for everything else
      }

      return 0.1; // 10% in non-production
    },

    release: process.env.npm_package_version || '1.0.0',
    maxBreadcrumbs: 50,
    maxValueLength: 1000,
  });

  console.log('Sentry initialized successfully!', {
    environment: config.env,
    dsn: config.sentry.dsn ? 'configured' : 'missing',
  });
}

export { Sentry };
