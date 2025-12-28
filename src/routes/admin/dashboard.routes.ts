import { Router } from 'express';
import {
  getAdminDashboard,
  getAnalytics,
  getVisitorInsights,
  getAdminStats,
  getSystemLogs
} from '../../controllers';

import { authenticateAdmin, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authenticateAdmin, getAdminDashboard);
router.get('/analytics', authenticateAdmin, getAnalytics);
router.get('/visitors', authenticateAdmin, getVisitorInsights);
router.get('/stats', authenticateAdmin, getAdminStats);

router.get('/logs', authenticateAdmin, authorizeAdmin('super_admin'), getSystemLogs);

export default router;
