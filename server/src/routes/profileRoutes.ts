import express from 'express';
import * as profileController from '../controllers/profileController';
import { authenticate, optionalAuth } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

// My profile operations
router.get('/me', authenticate, profileController.getMyProfile);
router.put('/me', authenticate, profileController.updateProfile);

// Photo management
router.post('/photos', authenticate, upload.single('photo'), profileController.uploadPhoto);
router.delete('/photos/:photoId', authenticate, profileController.deletePhoto);
router.put('/photos/:photoId/primary', authenticate, profileController.setPrimaryPhoto);

// Public profile view
router.get('/user/:userId', optionalAuth, profileController.getPublicProfile);

export default router;

