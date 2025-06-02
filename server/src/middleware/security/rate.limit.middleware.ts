import rateLimit from 'express-rate-limit';

const MINUTES_IN_MS = 60 * 1000;
const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: any) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs * MINUTES_IN_MS,
    max: options.max,
    message: { success: false, message: options.message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || (req => req.ip as string),
  });
};

export const registrationLinkLimiter = createRateLimiter({
  windowMs: 15, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many requests. Please try again later.',
});

export const globalRegistrationLinkLimiter = createRateLimiter({
  windowMs: 15, // 15 minutes
  max: 50, // 50 requests per 15 minutes
  message: `Registration system is currently overloaded, please try again later`,
  keyGenerator: () => 'global_registration_link_limiter',
});

export const emailLimiter = createRateLimiter({
  windowMs: 60, // 1 hour
  max: 5, // 5 attempts per hour
  message: 'Too many email requests. Please try again in an hour.',
  keyGenerator: req => `email_${req.body.email}`, // Rate limit per email address
});

export const globalEmailLimiter = createRateLimiter({
  windowMs: 15, // 15 minutes
  max: 100, // 100 verification emails across all users
  message: 'System is currently busy. Please try again later.',
  keyGenerator: () => 'global_email_limiter',
});

export const passwordResetLimiter = createRateLimiter({
  windowMs: 15, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many password reset attempts. Please try again later.',
  keyGenerator: req => `password_reset_${req.body.email}`, // Rate limit per email address
});

export const loginLimiter = createRateLimiter({
  windowMs: 15, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts. Please try again later.',
  keyGenerator: req => `login_${req.body.email}`, // Rate limit per email address
});
