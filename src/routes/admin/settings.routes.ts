import { Router } from 'express';
import {
  // Portfolio Settings
  getPortfolioSettings,
  updatePortfolioSettings,
  
  // Admin Profile
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword
} from '../../controllers';

import { authenticateAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// ==================== PORTFOLIO SETTINGS ====================
router.get('/portfolio', authenticateAdmin, getPortfolioSettings);
router.put('/portfolio', authenticateAdmin, updatePortfolioSettings);

// ==================== ADMIN PROFILE ====================
router.get('/profile', authenticateAdmin, getAdminProfile);
router.put('/profile', authenticateAdmin, updateAdminProfile);
router.put('/profile/password', authenticateAdmin, changeAdminPassword);

export default router;
