import express from 'express';
import * as interestController from '../controllers/interestController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/send', interestController.sendInterest);
router.put('/:interestId/accept', interestController.acceptInterest);
router.put('/:interestId/reject', interestController.rejectInterest);
router.delete('/:interestId/withdraw', interestController.withdrawInterest);

router.get('/received', interestController.getReceivedInterests);
router.get('/sent', interestController.getSentInterests);
router.get('/connections', interestController.getAcceptedConnections);

export default router;

