import express from 'express';
import {
  login,
  refresh,
  logout,
  createUser,
  validateSession,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
  sendPasswordResetEmail,
  verifyPasswordResetToken,
  resetPassword,
  sendMemberSetupEmail,
  completeVerificationWithPassword,
} from '@controllers/v1/auth.controller.js';
import {
  authenticate,
  authorize,
  validateLoginAttempt,
} from '@/middleware/security/auth.middleware.js';
import {
  emailLimiter,
  globalEmailLimiter,
  passwordResetLimiter,
  loginLimiter,
} from '@/middleware/security/rate.limit.middleware.js';
import { UserRole } from '@shared/constants/user.js';

const router = express.Router();
//self registration
router.post('/register', createUser);
//confirm account
router.get('/account-confirmation/:token', verifyEmail);
//resend verification email
router.post(
  '/resend-verification-email',
  emailLimiter,
  globalEmailLimiter,
  resendVerificationEmail
);
//send password reset email
router.post('/send-password-reset-email', passwordResetLimiter, sendPasswordResetEmail);
//verify password reset token
router.get('/password-reset-token-verification/:token', verifyPasswordResetToken);
//reset password
router.post('/password-reset', resetPassword);
//send member setup email
router.post(
  '/send-setup-email',
  emailLimiter,
  globalEmailLimiter,
  authenticate,
  authorize([UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF]),
  sendMemberSetupEmail
);
//complete verification with password
router.post('/account-confirmation-with-password', completeVerificationWithPassword);

router.post('/login', loginLimiter, validateLoginAttempt, login);
router.put('/refresh', refresh);
router.delete('/logout', authenticate, logout);
router.get('/valid-session', validateSession);
router.put('/change-password', authenticate, updatePassword);

export default router;
