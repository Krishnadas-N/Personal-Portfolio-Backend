import { Router } from 'express';
import { adminLogin } from '../../controllers';

const router = Router();

// ==================== ADMIN AUTHENTICATION ====================
router.post('/login', adminLogin);

export default router;
