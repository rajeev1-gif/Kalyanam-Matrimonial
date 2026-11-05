const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// My profile operations
router.get('/me', authenticate, profileController.getMyProfile);
router.put('/me', authenticate, profileController.updateProfile);

// Photo management
router.post('/photos', authenticate, upload.single('photo'), profileController.uploadPhoto);
router.delete('/photos/:photoId', authenticate, profileController.deletePhoto);
router.put('/photos/:photoId/primary', authenticate, profileController.setPrimaryPhoto);

// Public profile view
router.get('/user/:userId', optionalAuth, profileController.getPublicProfile);

module.exports = router;

