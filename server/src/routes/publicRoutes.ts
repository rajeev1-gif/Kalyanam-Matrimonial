import express from 'express';
import * as publicController from '../controllers/publicController';

const router = express.Router();

router.get('/success-stories', publicController.getSuccessStories);
router.get('/testimonials', publicController.getTestimonials);
router.get('/faqs', publicController.getFaqs);
router.get('/stats', publicController.getHomeStats);

export default router;

