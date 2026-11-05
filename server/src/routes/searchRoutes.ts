import express from 'express';
import * as searchController from '../controllers/searchController';
import { optionalAuth, authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/profiles', optionalAuth, searchController.searchProfiles);
router.get('/recommended', authenticate, searchController.getRecommendedMatches);
router.get('/featured', searchController.getFeaturedProfiles);
router.get('/recent', searchController.getRecentProfiles);

export default router;

