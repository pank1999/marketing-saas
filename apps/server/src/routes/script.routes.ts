import { Router } from 'express';
import {
  getProjectScript,
  getScriptInfo,
  updateAllowedUrls,
} from '../controllers/script.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public route to serve the script
router.get('/:projectId', getProjectScript);

// Protected routes
router.use(authMiddleware);
router.get('/:projectId/info', getScriptInfo);
router.put('/:projectId/allowed-urls', updateAllowedUrls);

export default router;
