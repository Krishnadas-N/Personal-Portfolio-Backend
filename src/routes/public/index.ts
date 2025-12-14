import { Router } from 'express';
import portfolioRoutes from './portfolio.routes';
import engagementRoutes from './engagement.routes';
import newsletterRoutes from './newsletter.routes';

const router = Router();

// Mount public routes
router.use('/', portfolioRoutes);
router.use('/', engagementRoutes);
router.use('/newsletter', newsletterRoutes);

export default router;
