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

// ==================== DASHBOARD & ANALYTICS ====================
router.get('/dashboard', authenticateAdmin, getAdminDashboard);
router.get('/analytics', authenticateAdmin, getAnalytics);
router.get('/visitors', authenticateAdmin, getVisitorInsights);
router.get('/stats', authenticateAdmin, getAdminStats);

// ==================== SYSTEM LOGS (Super Admin) ====================
router.get('/logs', authenticateAdmin, authorizeAdmin('super_admin'), getSystemLogs);

export default router;
