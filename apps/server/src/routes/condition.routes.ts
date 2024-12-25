import { Router } from 'express';
import { ConditionController } from '../controllers/condition.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateCondition } from '../middleware/validation.middleware';

const router = Router();
const conditionController = new ConditionController();

router.use(authMiddleware);

router.post(
  '/',
  validateCondition,
  conditionController.createCondition.bind(conditionController)
);
router.get(
  '/project/:projectId',
  conditionController.getProjectConditions.bind(conditionController)
);
router.put(
  '/:id',
  validateCondition,
  conditionController.updateCondition.bind(conditionController)
);
router.delete(
  '/:id',
  conditionController.deleteCondition.bind(conditionController)
);

export default router;
