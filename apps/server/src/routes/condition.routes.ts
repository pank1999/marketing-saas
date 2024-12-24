import { Router } from 'express';
import {
  createCondition,
  getProjectConditions,
  updateCondition,
  deleteCondition,
} from '../controllers/condition.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new condition
router.post('/', createCondition);

// Get all conditions for a project
router.get('/project/:projectId', getProjectConditions);

// Update a condition
router.put('/:id', updateCondition);

// Delete a condition
router.delete('/:id', deleteCondition);

export default router;
