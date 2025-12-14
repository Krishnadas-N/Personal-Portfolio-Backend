import { Router } from 'express';
import publicRoutes from './public';
import adminRoutes from './admin';
import authRoutes from './auth';

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Portfolio, blogs, projects, engagement, newsletter, etc.
router.use('/', publicRoutes);

// ==================== USER AUTH ROUTES ====================
// Register, login, me, change password, etc.
router.use('/auth', authRoutes);

// ==================== ADMIN ROUTES ====================
// Dashboard, content management, media, settings, etc.
router.use('/admin', adminRoutes);

export default router;
