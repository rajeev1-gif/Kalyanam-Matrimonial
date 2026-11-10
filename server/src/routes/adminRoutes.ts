import express from 'express';
import * as adminController from '../controllers/adminController';
import * as adminMembershipController from '../controllers/adminMembershipController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authenticate, requireAdmin);

// Dashboard Analytics & User Moderation
router.get('/analytics', adminController.getDashboardAnalytics);
router.get('/users', adminController.getUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.put('/profiles/:profileId/verification', adminController.toggleProfileVerification);
router.get('/reports', adminController.getReports);
router.put('/reports/:reportId/status', adminController.updateReportStatus);
router.put('/plans/:planId', adminController.updatePlan);

// Admin Membership Management (Phase 4)
router.post('/memberships/grant', adminMembershipController.grantMembership);
router.patch('/memberships/:id/extend', adminMembershipController.extendMembership);
router.patch('/memberships/:id/revoke', adminMembershipController.revokeMembership);
router.get('/memberships', adminMembershipController.getMemberships);
router.get('/memberships/users/:userId/history', adminMembershipController.getUserMembershipHistory);
router.get('/memberships/:id', adminMembershipController.getMembershipById);

// Content management
router.post('/success-stories', adminController.createSuccessStory);
router.delete('/success-stories/:id', adminController.deleteSuccessStory);
router.post('/faqs', adminController.createFaq);
router.delete('/faqs/:id', adminController.deleteFaq);

export default router;
