import { Router } from 'express';
import {
  getCommentsManagement,
  updateCommentStatus,
  deleteComment
} from '../../controllers';

import { authenticateAdmin } from '../../middlewares/auth.middleware';

const router = Router();


router.get('/', authenticateAdmin, getCommentsManagement);
router.patch('/:id/status', authenticateAdmin, updateCommentStatus);
router.delete('/:id', authenticateAdmin, deleteComment);

export default router;
