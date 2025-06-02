import express from 'express';
import { UserRoleAccess } from '@shared/constants/user.js';
import {
  createMembershipPlan,
  getMembershipPlans,
  toggleMembershipPlanStatus,
} from '@/controllers/v1/membership.plan.controller.js';
import { authenticate, authorize } from '@/middleware/security/auth.middleware.js';
import { UserRole } from '@shared/constants/user.js';

const router = express.Router();

router.post('/', authenticate, authorize(UserRoleAccess[UserRole.ADMIN]), createMembershipPlan);
router.get('/', authenticate, authorize(UserRoleAccess[UserRole.MEMBER]), getMembershipPlans);
router.patch(
  '/:planId/toggle',
  authenticate,
  authorize(UserRoleAccess[UserRole.ADMIN]),
  toggleMembershipPlanStatus
);

export default router;
