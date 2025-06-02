import express from 'express';
import { authenticate, authorize } from '@/middleware/security/auth.middleware.js';
import { UserRoleAccess, UserRole } from '@shared/constants/user.js';
import { getPaymentTransactions } from '@/controllers/v1/payment.transaction.controller.js';
const router = express.Router();

router.get('/', authenticate, authorize(UserRoleAccess[UserRole.ADMIN]), getPaymentTransactions);

export default router;
