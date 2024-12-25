import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  validateSignup,
  validateLogin,
} from '../middleware/validation.middleware';

const router = Router();
const authController = new AuthController();

router.post(
  '/signup',
  validateSignup,
  authController.signup.bind(authController)
);
router.post('/login', validateLogin, authController.login.bind(authController));

export default router;
