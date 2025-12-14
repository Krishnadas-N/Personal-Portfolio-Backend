import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import contentRoutes from './content.routes';
import mediaRoutes from './media.routes';
import commentsRoutes from './comments.routes';
import contactsRoutes from './contacts.routes';
import newsletterRoutes from './newsletter.routes';
import settingsRoutes from './settings.routes';

const router = Router();

// Mount admin routes
router.use('/auth', authRoutes);
router.use('/', dashboardRoutes);
router.use('/content', contentRoutes);
router.use('/media', mediaRoutes);
router.use('/comments', commentsRoutes);
router.use('/contacts', contactsRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/settings', settingsRoutes);

export default router;
