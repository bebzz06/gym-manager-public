import express from 'express';
import {
  updateProfile,
  getProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from '@controllers/v1/profile.controller.js';
import { authenticate } from '@/middleware/security/auth.middleware.js';
import {
  uploadImage,
  handleUploadErrors,
  optimizeImage,
} from '@/middleware/common/storage.middleware.js';

const router = express.Router();

router.put('/', authenticate, updateProfile);
router.get('/', authenticate, getProfile);

// Use the middleware for file uploads
router.post(
  '/profile-picture',
  authenticate,
  uploadImage.single('profileImage'),
  handleUploadErrors,
  optimizeImage,
  uploadProfilePicture
);

router.delete('/profile-picture', authenticate, deleteProfilePicture);

export default router;
