import { Router } from 'express';

import QuizController from '../controllers/quiz.controller.js';
import {
    authenticate,
    authorizeRoles,
} from '../middleware/auth.middleware.js';

const quizRoutes: Router = Router();
const controller = new QuizController();

/**
 * ADMIN QUIZ ROUTES
 */

// POST /api/quiz - Create a quiz
quizRoutes.post(
    '/',
    authenticate,
    authorizeRoles('super_admin'),
    controller.createQuiz.bind(controller),
);

// PUT /api/quiz/:id - Update a quiz
quizRoutes.put(
    '/:id',
    authenticate,
    authorizeRoles('super_admin'),
    controller.updateQuiz.bind(controller),
);

// DELETE /api/quiz/:id - Delete a quiz
quizRoutes.delete(
    '/:id',
    authenticate,
    authorizeRoles('super_admin'),
    controller.deleteQuiz.bind(controller),
);

export default quizRoutes;
