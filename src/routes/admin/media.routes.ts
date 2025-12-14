import { Router } from 'express';
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedFiles,
  deleteMediaFile,
  getSignedUrlForFile,
  listMediaFiles,
  getMediaStatistics
} from '../../controllers';

import { authenticateAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// ==================== MEDIA MANAGEMENT ====================
router.post('/images', authenticateAdmin, uploadSingleImage);
router.post('/images/batch', authenticateAdmin, uploadMultipleImages);
router.post('/files', authenticateAdmin, uploadMixedFiles);
router.get('/files', authenticateAdmin, listMediaFiles);
router.get('/files/:key/signed-url', authenticateAdmin, getSignedUrlForFile);
router.delete('/files/:key', authenticateAdmin, deleteMediaFile);
router.get('/statistics', authenticateAdmin, getMediaStatistics);

export default router;
