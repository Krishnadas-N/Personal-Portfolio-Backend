import { Router } from 'express';
import {
  getNewsletterSubscribers,
  manualSubscribe,
  toggleSubscriptionStatus,
  updateSubscriberStatus,
  exportSubscribers,
  getNewsletterCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign
} from '../../controllers';

import { authenticateAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// ==================== SUBSCRIBERS ====================
router.get('/subscribers', authenticateAdmin, getNewsletterSubscribers);
router.post('/subscribe', authenticateAdmin, manualSubscribe);
router.post('/toggle-status', authenticateAdmin, toggleSubscriptionStatus);
router.patch('/subscribers/:id/status', authenticateAdmin, updateSubscriberStatus);
router.get('/subscribers/export', authenticateAdmin, exportSubscribers);

// ==================== CAMPAIGNS ====================
router.get('/campaigns', authenticateAdmin, getNewsletterCampaigns);
router.post('/campaigns', authenticateAdmin, createCampaign);
router.get('/campaigns/:id', authenticateAdmin, getCampaign);
router.put('/campaigns/:id', authenticateAdmin, updateCampaign);
router.patch('/campaigns/:id/status', authenticateAdmin, updateCampaignStatus);
router.delete('/campaigns/:id', authenticateAdmin, deleteCampaign);

export default router;
