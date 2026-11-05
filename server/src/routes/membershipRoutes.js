const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { authenticate } = require('../middleware/auth');

router.get('/plans', membershipController.getAllPlans);
router.get('/current', authenticate, membershipController.getCurrentSubscription);
router.post('/orders', authenticate, membershipController.createOrder);
router.post('/verify', authenticate, membershipController.verifyPayment);
router.get('/payments', authenticate, membershipController.getPaymentHistory);

module.exports = router;

