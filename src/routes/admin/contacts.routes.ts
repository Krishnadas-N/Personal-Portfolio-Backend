import { Router } from 'express';
import {
  getContacts,
  getContact,
  updateContactStatus,
  replyToContact,
  markAsSpam,
  assignContact,
  deleteContact,
  getContactStats
} from '../../controllers';

import { authenticateAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateAdmin, getContacts);
router.get('/stats', authenticateAdmin, getContactStats);
router.get('/:id', authenticateAdmin, getContact);
router.patch('/:id/status', authenticateAdmin, updateContactStatus);
router.post('/:id/reply', authenticateAdmin, replyToContact);
router.patch('/:id/spam', authenticateAdmin, markAsSpam);
router.patch('/:id/assign', authenticateAdmin, assignContact);
router.delete('/:id', authenticateAdmin, deleteContact);

export default router;
