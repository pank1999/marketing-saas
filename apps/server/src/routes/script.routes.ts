import { Router } from 'express';
import { ScriptController } from '../controllers/script.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const scriptController = new ScriptController();

router.use(authMiddleware);

router.get(
  '/:projectId',
  scriptController.getProjectScript.bind(scriptController)
);
router.get(
  '/info/:projectId',
  scriptController.getScriptInfo.bind(scriptController)
);

export default router;
