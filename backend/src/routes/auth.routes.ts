import { Router } from 'express';

import AuthController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const authRoutes: Router = Router();
const controller = new AuthController();

//TODO: authRoutes.post('/signup', controller.signup.bind(controller));
//TODO: authRoutes.post('/login', controller.login.bind(controller));
//TODO: authRoutes.post('/logout', authenticate, controller.logout.bind(controller));

export default authRoutes;
