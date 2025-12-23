import { Router } from 'express';

import UserController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const userRoutes: Router = Router();
const controller = new UserController();

userRoutes.put(
  '/onboarding',
  authenticate,
  controller.complete.bind(controller),
);

export default userRoutes;
