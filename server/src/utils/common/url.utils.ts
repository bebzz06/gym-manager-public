import config from '@/config/index.js';

export const constructRegistrationLink = (publicToken: string): string => {
  if (!config.server.clientUrl) {
    throw new Error('CLIENT_URL environment variable is not set');
  }
  return `${config.server.clientUrl}/register/${publicToken}`;
};

export const constructEmailVerificationLink = (publicToken: string): string => {
  if (!config.server.clientUrl) {
    throw new Error('CLIENT_URL environment variable is not set');
  }
  return `${config.server.clientUrl}/confirm-account?token=${publicToken}`;
};

export const constructPasswordResetLink = (publicToken: string): string => {
  if (!config.server.clientUrl) {
    throw new Error('CLIENT_URL environment variable is not set');
  }
  return `${config.server.clientUrl}/reset-password?token=${publicToken}`;
};
