import { Router } from 'express';
import { ScriptController } from '../controllers/script.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const scriptController = new ScriptController();

router.get('/:projectId', scriptController.serveProjectScript);
router.use(authMiddleware);
router.get('/:projectId/info', authMiddleware, scriptController.getScriptInfo);

export default router;
