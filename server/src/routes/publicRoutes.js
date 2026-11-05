const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/success-stories', publicController.getSuccessStories);
router.get('/testimonials', publicController.getTestimonials);
router.get('/faqs', publicController.getFaqs);
router.get('/stats', publicController.getHomeStats);

module.exports = router;

