import express from 'express';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.get('/unread-count', chatController.getUnreadCount);

export default router;

