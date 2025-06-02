import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

if (process.env.NODE_ENV) {
  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
    override: true,
  });
}

const radix = 10;

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NODE_ENV === 'staging',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3000', radix),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },

  database: {
    uri: process.env.MONGODB_URI || 'mongodburi',
    dbName: process.env.DB_NAME || 'dbName',
  },
  api: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    version: process.env.API_VERSION || '/api/v1',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    accessTokenExpirationTimeInMinutes:
      parseInt(process.env.ACCESS_TOKEN_EXPIRATION_TIME_IN_MINUTES || '', radix) || 15,
    refreshTokenExpirationTimeInDays:
      parseInt(process.env.REFRESH_TOKEN_EXPIRATION_TIME_IN_DAYS || '', radix) || 7,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'firebase-project-id',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-client-email',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'firebase-private-key',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'firebase-storage-bucket',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || 'your-resend-api-key',
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  },
  pagueloFacil: {
    url: process.env.PAGUELO_FACIL_URL || 'https://sandbox.paguelofacil.com/LinkDeamon.cfm',
  },
  sentry: {
    enabled: (process.env.ENABLE_SENTRY || 'false').toLowerCase() === 'true',
    dsn: process.env.SENTRY_DSN || '',
  },
  cookies: {
    domain: process.env.NODE_ENV === 'development' ? undefined : '.dojomanager.io',
  },
};

const requiredEnvVars = ['NODE_ENV', 'MONGODB_URI', 'JWT_SECRET'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
export default config;
