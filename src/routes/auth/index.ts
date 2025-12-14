import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  changePassword
} from '../../controllers';

import { authenticateToken } from '../../middlewares/auth.middleware';
import { userValidations } from '../../middlewares/validation';

const router = Router();

// ==================== PUBLIC AUTH ====================
router.post('/register', userValidations.register, register);
router.post('/login', userValidations.login, login);

// ==================== PROTECTED AUTH ====================
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, userValidations.updateProfile, updateMe);
router.put('/change-password', authenticateToken, changePassword);

export default router;
