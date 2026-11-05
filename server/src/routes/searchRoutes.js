const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { optionalAuth, authenticate } = require('../middleware/auth');

router.get('/profiles', optionalAuth, searchController.searchProfiles);
router.get('/recommended', authenticate, searchController.getRecommendedMatches);
router.get('/featured', searchController.getFeaturedProfiles);
router.get('/recent', searchController.getRecentProfiles);

module.exports = router;

