import { Router } from 'express';

import QuizAttemptController from '../controllers/quizAttempt.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const quizAttemptRoutes: Router = Router();
const controller = new QuizAttemptController();

quizAttemptRoutes.get(
  '/',
  authenticate,
  controller.getAllQuizAttempts.bind(controller),
);

quizAttemptRoutes.get(
  '/quiz/:quizId',
  authenticate,
  controller.getQuizAttemptsByQuizId.bind(controller),
);

quizAttemptRoutes.get(
  '/user/:userId',
  authenticate,
  controller.getQuizAttemptsByUserId.bind(controller),
);

export default quizAttemptRoutes;
