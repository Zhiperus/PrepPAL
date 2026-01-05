import { Router } from 'express';

import ModuleController from '../controllers/module.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const moduleRoutes: Router = Router();
const controller = new ModuleController();

/**
 * MODULE ROUTES
 */

// GET /api/modules - Get all modules (paginated)
moduleRoutes.get('/', controller.getAllModules.bind(controller));

// GET /api/modules/search - Search modules (paginated)
// IMPORTANT: This must come before /:id
moduleRoutes.get('/search', controller.searchModules.bind(controller));

// GET /api/modules/:id - Get a single module by ID
moduleRoutes.get('/:id/quiz', controller.getQuiz.bind(controller));
/**
 * QUIZ ROUTES
 */

// GET /api/modules/:id/quiz - Get the quiz for a module
moduleRoutes.get(
  '/:id/quiz', 
  authenticate, 
  controller.getQuiz.bind(controller)
);

// POST /api/modules/:id/quiz-attempt - Submit a quiz
moduleRoutes.post(
  '/:id/quiz-attempt', 
  authenticate, 
  controller.handleQuizSubmission.bind(controller)
);

// GET /api/modules/:id/quiz-attempt - Get user attempt history
moduleRoutes.get(
  '/:id/quiz-attempt', 
  authenticate, 
  controller.getQuizAttemptsByUserAndQuizId.bind(controller)
);

export default moduleRoutes;