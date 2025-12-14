import { Router } from 'express';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter
} from '../../controllers';

const router = Router();

// ==================== NEWSLETTER ====================
router.post('/subscribe', subscribeToNewsletter);
router.post('/unsubscribe', unsubscribeFromNewsletter);

export default router;
