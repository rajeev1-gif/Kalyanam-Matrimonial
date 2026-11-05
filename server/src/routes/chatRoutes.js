const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.get('/unread-count', chatController.getUnreadCount);

module.exports = router;

