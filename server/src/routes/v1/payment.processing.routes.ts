import express from 'express';
import {
  createPagueloFacilPaymentLink,
  verifyPagueloFacilPayment,
  confirmCashPayment,
  createCashPaymentTransaction,
} from '@/controllers/v1/payment.processing.controller.js';
import { authenticate, authorize } from '@/middleware/security/auth.middleware.js';
import { UserRoleAccess, UserRole } from '@shared/constants/user.js';

const router = express.Router();

router.post('/paguelo-facil/button', authenticate, createPagueloFacilPaymentLink);
router.post('/paguelo-facil/verify', verifyPagueloFacilPayment);
router.post(
  '/cash/',
  authenticate,
  authorize(UserRoleAccess[UserRole.ADMIN]),
  createCashPaymentTransaction
);
router.post(
  '/cash/confirm',
  authenticate,
  authorize(UserRoleAccess[UserRole.ADMIN]),
  confirmCashPayment
);
export default router;
