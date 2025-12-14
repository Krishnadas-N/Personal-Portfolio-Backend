import { Router } from 'express';
import {
  getNewsletterSubscribers,
  getNewsletterCampaigns
} from '../../controllers';

import { authenticateAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// ==================== NEWSLETTER MANAGEMENT ====================
router.get('/subscribers', authenticateAdmin, getNewsletterSubscribers);
router.get('/campaigns', authenticateAdmin, getNewsletterCampaigns);

export default router;
