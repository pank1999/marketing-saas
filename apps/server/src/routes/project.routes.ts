import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateProject } from '../middleware/validation.middleware';

const router = Router();
const projectController = new ProjectController();

router.use(authMiddleware);

router.post(
  '/',
  validateProject,
  projectController.createProject.bind(projectController)
);
router.get('/', projectController.getProjects.bind(projectController));
router.get('/:id', projectController.getProject.bind(projectController));
router.put(
  '/:id',
  validateProject,
  projectController.updateProject.bind(projectController)
);
router.delete('/:id', projectController.deleteProject.bind(projectController));

export default router;
