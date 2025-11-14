import { Router } from 'express';

import QuizAttemptController from '../controllers/quizAttempt.controller';

const quizAttemptRoutes: Router = Router();
const controller = new QuizAttemptController();

export default quizAttemptRoutes;
