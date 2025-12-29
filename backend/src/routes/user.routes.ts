import { Router } from 'express';

import UserController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const userRoutes: Router = Router();
const controller = new UserController();

userRoutes.put(
  '/onboarding',
  authenticate,
  controller.complete.bind(controller),
);

userRoutes.patch(
  '/avatar',
  authenticate,
  controller.updateAvatar.bind(controller),
);

export default userRoutes;
