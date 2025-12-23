import { Router } from 'express';

import AuthController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateAuth } from '../middleware/validate.middleware.js';

const authRoutes: Router = Router();
const controller = new AuthController();

authRoutes.get('/me', authenticate, controller.me.bind(controller));
authRoutes.post(
  '/signup',
  validateAuth('register'),
  controller.signup.bind(controller),
);
authRoutes.post(
  '/login',
  validateAuth('login'),
  controller.login.bind(controller),
);

authRoutes.post('/forgot-password', controller.forgotPassword.bind(controller));
authRoutes.post('/reset-password', controller.resetPassword.bind(controller));
authRoutes.post('/verify-email', controller.verifyEmail.bind(controller));

export default authRoutes;
