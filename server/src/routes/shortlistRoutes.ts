import express from 'express';
import * as shortlistController from '../controllers/shortlistController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/toggle', shortlistController.toggleShortlist);
router.get('/', shortlistController.getMyShortlists);
router.get('/profile-views', shortlistController.getProfileViews);

export default router;

