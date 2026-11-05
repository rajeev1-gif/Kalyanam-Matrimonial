const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/report', safetyController.reportUser);
router.post('/block', safetyController.blockUser);
router.delete('/block/:blockedUserId', safetyController.unblockUser);
router.get('/blocked', safetyController.getBlockedUsers);

module.exports = router;

