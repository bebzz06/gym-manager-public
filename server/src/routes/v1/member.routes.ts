import express from 'express';
import {
  searchGuardian,
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  searchMembers,
} from '@/controllers/v1/member.controller.js';
import { authenticate, authorize } from '@/middleware/security/auth.middleware.js';
import { UserRole } from '@shared/constants/user.js';

const router = express.Router();

router.get('/guardians', authenticate, searchGuardian);
router.post('/', authenticate, authorize([UserRole.OWNER, UserRole.ADMIN]), createMember);
router.get('/', authenticate, authorize([UserRole.OWNER, UserRole.ADMIN]), getMembers);
router.get('/search', authenticate, authorize([UserRole.OWNER, UserRole.ADMIN]), searchMembers);

router.get('/:id', authenticate, authorize([UserRole.OWNER, UserRole.ADMIN]), getMemberById);

router.put('/:id', authenticate, authorize([UserRole.OWNER, UserRole.ADMIN]), updateMember);

router.delete('/:id', authenticate, authorize([UserRole.OWNER, UserRole.ADMIN]), deleteMember);

export default router;
