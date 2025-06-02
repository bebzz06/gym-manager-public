import express from 'express';
import {
  createGym,
  uploadGymLogoImage,
  deleteGymLogoImage,
  updateGymInfo,
} from '@/controllers/v1/gym.controller.js';
import { authenticate } from '@/middleware/security/auth.middleware.js';
import {
  uploadImage,
  handleUploadErrors,
  optimizeImage,
} from '@/middleware/common/storage.middleware.js';

const router = express.Router();

router.post('/register', createGym);

// Add new routes for logo management
router.post(
  '/logo',
  authenticate,
  uploadImage.single('logo'),
  handleUploadErrors,
  optimizeImage,
  uploadGymLogoImage
);

router.delete('/logo', authenticate, deleteGymLogoImage);

router.put('/', authenticate, updateGymInfo);

export default router;
