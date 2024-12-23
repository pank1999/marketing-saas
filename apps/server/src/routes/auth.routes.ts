import { Router } from 'express';
import { login, signup } from '../controllers/auth.controller';
import {
  validateLogin,
  validateSignup,
} from '../middleware/validation.middleware';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

export default router;
