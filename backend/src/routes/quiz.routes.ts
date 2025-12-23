import { Router } from 'express';

import QuizController from '../controllers/quiz.controller.js';

const quizRoutes: Router = Router();
const controller = new QuizController();

export default quizRoutes;
