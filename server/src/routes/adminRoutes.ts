import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/analytics', adminController.getDashboardAnalytics);
router.get('/users', adminController.getUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.put('/profiles/:profileId/verification', adminController.toggleProfileVerification);
router.get('/reports', adminController.getReports);
router.put('/reports/:reportId/status', adminController.updateReportStatus);
router.put('/plans/:planId', adminController.updatePlan);

// Content management
router.post('/success-stories', adminController.createSuccessStory);
router.delete('/success-stories/:id', adminController.deleteSuccessStory);
router.post('/faqs', adminController.createFaq);
router.delete('/faqs/:id', adminController.deleteFaq);

export default router;

