import { Router } from 'express';

import QuizAttemptController from '../controllers/quizAttempt.controller.js';

const quizAttemptRoutes: Router = Router();
const controller = new QuizAttemptController();

export default quizAttemptRoutes;
