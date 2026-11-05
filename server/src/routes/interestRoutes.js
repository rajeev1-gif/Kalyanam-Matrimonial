const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/send', interestController.sendInterest);
router.put('/:interestId/accept', interestController.acceptInterest);
router.put('/:interestId/reject', interestController.rejectInterest);
router.delete('/:interestId/withdraw', interestController.withdrawInterest);

router.get('/received', interestController.getReceivedInterests);
router.get('/sent', interestController.getSentInterests);
router.get('/connections', interestController.getAcceptedConnections);

module.exports = router;

