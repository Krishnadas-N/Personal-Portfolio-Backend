import { Router } from 'express';
import adminRoutes from './admin';
import userRoutes from './user';
import apiRoutes from './apiRoutes';

const router = Router();

// Mount route modules
router.use('/', userRoutes);
router.use('/admin', adminRoutes);
router.use('/api', apiRoutes);

export default router;
