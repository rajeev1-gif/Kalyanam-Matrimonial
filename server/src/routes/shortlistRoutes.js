const express = require('express');
const router = express.Router();
const shortlistController = require('../controllers/shortlistController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/toggle', shortlistController.toggleShortlist);
router.get('/', shortlistController.getMyShortlists);
router.get('/profile-views', shortlistController.getProfileViews);

module.exports = router;

