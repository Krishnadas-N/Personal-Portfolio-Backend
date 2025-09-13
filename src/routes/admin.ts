import { Router } from 'express';
import {
  // Admin routes
  adminLogin,
  getDashboardStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getSystemLogs,
  getAdminStats
} from '../controllers';

import {
  authenticateAdmin,
  authorizeAdmin
} from '../middlewares/auth.middleware';

const router = Router();

// Admin authentication
router.post('/login', adminLogin);

// Admin dashboard and profile
router.get('/dashboard', authenticateAdmin, getDashboardStats);
router.get('/profile', authenticateAdmin, getAdminProfile);
router.put('/profile', authenticateAdmin, updateAdminProfile);
router.put('/change-password', authenticateAdmin, changeAdminPassword);
router.get('/stats', authenticateAdmin, getAdminStats);

// Admin user management
router.get('/users', authenticateAdmin, getUsers);
router.get('/users/:id', authenticateAdmin, getUser);
router.put('/users/:id', authenticateAdmin, updateUser);
router.delete('/users/:id', authenticateAdmin, deleteUser);
router.patch('/users/:id/toggle', authenticateAdmin, toggleUserStatus);

// Super admin routes
router.get('/logs', authenticateAdmin, authorizeAdmin('super_admin'), getSystemLogs);

export default router;
