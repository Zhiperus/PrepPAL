import { Router } from 'express';

import AuthController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateAuth } from '../middleware/validate.middleware';

const authRoutes: Router = Router();
const controller = new AuthController();

authRoutes.post(
  '/signup',
  validateAuth('register'),
  controller.signup.bind(controller),
);
authRoutes.post('/login', validateAuth('login'), controller.login.bind(controller));

export default authRoutes;
