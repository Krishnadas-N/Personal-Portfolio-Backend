import { Router } from 'express';
import publicRoutes from './public';
import adminRoutes from './admin';

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Portfolio, blogs, projects, engagement, newsletter, etc.
router.use('/', publicRoutes);

// ==================== ADMIN ROUTES ====================
// Dashboard, content management, media, settings, etc.
router.use('/admin', adminRoutes);

export default router;
