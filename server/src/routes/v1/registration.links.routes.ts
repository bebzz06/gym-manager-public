import express from 'express';
import {
  createRegistrationLink,
  expireRegistrationLink,
  getMemberRegistrationLinks,
  revokeRegistrationLink,
  validateRegistrationLink,
} from '@/controllers/v1/registration.link.controller.js';
import { authenticate, authorize } from '@/middleware/security/auth.middleware.js';
import {
  globalRegistrationLinkLimiter,
  registrationLinkLimiter,
} from '@/middleware/security/rate.limit.middleware.js';
import { UserRole } from '@shared/constants/user.js';

const router = express.Router();
router.get(
  '/',
  authenticate,
  authorize([UserRole.OWNER, UserRole.ADMIN]),
  getMemberRegistrationLinks
);
router.post(
  '/new',
  authenticate,
  authorize([UserRole.OWNER, UserRole.ADMIN]),
  createRegistrationLink
);
router.patch(
  '/revoked/:id',
  authenticate,
  authorize([UserRole.OWNER, UserRole.ADMIN]),
  revokeRegistrationLink
);
router.patch(
  '/expired/:id',
  authenticate,
  authorize([UserRole.OWNER, UserRole.ADMIN]),
  expireRegistrationLink
);
router.get(
  '/valid/:token',
  registrationLinkLimiter,
  globalRegistrationLinkLimiter,
  validateRegistrationLink
);
export default router;
