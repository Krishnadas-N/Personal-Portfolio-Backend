import { Router } from 'express';
import {
  // Admin Dashboard Controllers
  getAdminDashboard,
  getPortfolioSettings,
  updatePortfolioSettings,
  getAnalytics,
  getVisitorInsights,
  getNewsletterSubscribers,
  getNewsletterCampaigns,
  getCommentsManagement,
  updateCommentStatus,
  deleteComment,
  
  // Media Management Controllers
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedFiles,
  deleteMediaFile,
  getSignedUrlForFile,
  listMediaFiles,
  getMediaStatistics,
  
  // User Engagement Controllers
  trackPageVisit,
  toggleContentLike,
  submitComment,
  getPostComments,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getPublicStatistics,
  searchPortfolioContent,
  getRelatedContent
} from '../controllers';

import {
  authenticateAdmin,
  optionalAuth
} from '../middlewares/auth.middleware';

const router = Router();

// ==================== ADMIN DASHBOARD ROUTES ====================
// Dashboard and analytics
router.get('/admin/dashboard', authenticateAdmin, getAdminDashboard);
router.get('/admin/analytics', authenticateAdmin, getAnalytics);
router.get('/admin/visitors', authenticateAdmin, getVisitorInsights);

// Portfolio settings management
router.get('/admin/settings', authenticateAdmin, getPortfolioSettings);
router.put('/admin/settings', authenticateAdmin, updatePortfolioSettings);

// Newsletter management
router.get('/admin/newsletter/subscribers', authenticateAdmin, getNewsletterSubscribers);
router.get('/admin/newsletter/campaigns', authenticateAdmin, getNewsletterCampaigns);

// Comment management
router.get('/admin/comments', authenticateAdmin, getCommentsManagement);
router.patch('/admin/comments/:id/status', authenticateAdmin, updateCommentStatus);
router.delete('/admin/comments/:id', authenticateAdmin, deleteComment);

// ==================== MEDIA MANAGEMENT ROUTES ====================
// Single image upload
router.post('/admin/media/images', authenticateAdmin, uploadSingleImage);

// Multiple images upload
router.post('/admin/media/images/batch', authenticateAdmin, uploadMultipleImages);

// Mixed files upload
router.post('/admin/media/files', authenticateAdmin, uploadMixedFiles);

// File management
router.delete('/admin/media/files/:key', authenticateAdmin, deleteMediaFile);
router.get('/admin/media/files/:key/signed-url', authenticateAdmin, getSignedUrlForFile);
router.get('/admin/media/files', authenticateAdmin, listMediaFiles);
router.get('/admin/media/statistics', authenticateAdmin, getMediaStatistics);

// ==================== USER ENGAGEMENT ROUTES ====================
// Analytics tracking
router.post('/analytics/page-visits', trackPageVisit);

// Content engagement
router.post('/engagement/likes/:itemType/:itemId', toggleContentLike);

// Comment system
router.post('/engagement/comments', submitComment);
router.get('/engagement/comments/:postType/:postId', getPostComments);

// Newsletter communication
router.post('/communication/newsletter/subscribe', subscribeToNewsletter);
router.post('/communication/newsletter/unsubscribe', unsubscribeFromNewsletter);

// ==================== PUBLIC API ROUTES ====================
// Public statistics
router.get('/public/statistics', getPublicStatistics);

// Content discovery
router.get('/public/search', searchPortfolioContent);
router.get('/public/content/related/:type/:id', getRelatedContent);

export default router;
