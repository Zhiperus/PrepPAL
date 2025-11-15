import { Router } from 'express';

import UserController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const userRoutes: Router = Router();
const controller = new UserController();

userRoutes.get('/me', authenticate, controller.me.bind(controller));

export default userRoutes;
