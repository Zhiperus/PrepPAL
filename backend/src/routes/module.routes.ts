import { Router } from 'express';

import ModuleController from '../controllers/module.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const moduleRoutes: Router = Router();
const controller = new ModuleController();

moduleRoutes.get(
  '/:id/quiz-attempt',
  authenticate,
  controller.getQuizAttemptsByUserAndQuizId.bind(controller),
);

moduleRoutes.post(
  '/:id/quiz-attempt',
  authenticate,
  controller.handleQuizSubmission.bind(controller),
);

moduleRoutes.get(
  '/:id/quiz',
  authenticate,
  controller.getQuiz.bind(controller),
);

moduleRoutes.get('/', controller.getAllModules.bind(controller));

moduleRoutes.get('/:id', authenticate, controller.getModule.bind(controller));

export default moduleRoutes;
