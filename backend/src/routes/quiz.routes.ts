import { Router } from 'express';

import QuizController from '../controllers/quiz.controller';

const quizRoutes: Router = Router();
const controller = new QuizController();

export default quizRoutes;
