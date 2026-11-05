import express from 'express';
import * as safetyController from '../controllers/safetyController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/report', safetyController.reportUser);
router.post('/block', safetyController.blockUser);
router.delete('/block/:blockedUserId', safetyController.unblockUser);
router.get('/blocked', safetyController.getBlockedUsers);

export default router;

