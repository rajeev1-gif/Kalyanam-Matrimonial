import express from 'express';
import * as membershipController from '../controllers/membershipController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/plans', membershipController.getAllPlans);
router.get('/current', authenticate, membershipController.getCurrentSubscription);
router.post('/orders', authenticate, membershipController.createOrder);
router.post('/verify', authenticate, membershipController.verifyPayment);
router.get('/payments', authenticate, membershipController.getPaymentHistory);

export default router;

