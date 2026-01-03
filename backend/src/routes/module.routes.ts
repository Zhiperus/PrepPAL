import { Router } from 'express';

import ModuleController from '../controllers/module.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const moduleRoutes: Router = Router();
const controller = new ModuleController();

moduleRoutes.get(
  '/:id/quiz-attempt',
  authenticate,
  controller.getQuizAttempts.bind(controller),
);

moduleRoutes.post(
  '/:id/quiz-attempt',
  authenticate,
  controller.handleQuizSubmission.bind(controller),
);

export default moduleRoutes;
