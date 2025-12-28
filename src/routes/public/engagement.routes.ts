import { Router } from 'express';
import {
  // Analytics
  trackPageVisit,
  getPublicStatistics,
  searchPortfolioContent,
  getRelatedContent,

  // Engagement
  toggleContentLike,
  likeProject,
  likeBlog,

  // Comments
  submitComment,
  getPostComments,
  recordPostVisit,

  // Contact
  submitContact
} from '../../controllers';

import { contactValidations } from '../../middlewares/validation';

const router = Router();

// ==================== ANALYTICS ====================
router.post('/analytics/page-visits', trackPageVisit);
router.post('/analytics/visit-post', recordPostVisit);
router.get('/statistics', getPublicStatistics);
router.get('/search', searchPortfolioContent);
router.get('/content/related/:type/:id', getRelatedContent);

// ==================== LIKES ====================
router.post('/likes/:itemType/:itemId', toggleContentLike);
router.post('/projects/:id/like', likeProject);
router.post('/blogs/:id/like', likeBlog);

// ==================== COMMENTS ====================
router.post('/comments', submitComment);
router.get('/comments/:postType/:postId', getPostComments);

// ==================== CONTACT ====================
router.post('/contact', contactValidations.create, submitContact);

export default router;
