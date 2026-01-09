import { Router } from 'express';

import ModuleController from '../controllers/module.controller.js';
import {
  authenticate,
  authorizeRoles,
} from '../middleware/auth.middleware.js';

const moduleRoutes: Router = Router();
const controller = new ModuleController();

/**
 * MODULE ROUTES
 */

// GET /api/modules - Get all modules (paginated)
moduleRoutes.get('/', authenticate, controller.getAllModules.bind(controller));

// POST /api/modules - Create a new module (Admin)
moduleRoutes.post(
  '/',
  authenticate,
  authorizeRoles('super_admin'),
  controller.createModule.bind(controller),
);

// PUT /api/modules/:id - Update a module (Admin)
moduleRoutes.put(
  '/:id',
  authenticate,
  authorizeRoles('super_admin'),
  controller.updateModule.bind(controller),
);

// DELETE /api/modules/:id - Delete a module (Admin)
moduleRoutes.delete(
  '/:id',
  authenticate,
  authorizeRoles('super_admin'),
  controller.deleteModule.bind(controller),
);

// GET /api/modules/search - Search modules (paginated)
// IMPORTANT: This must come before /:id
moduleRoutes.get(
  '/search',
  authenticate,
  controller.searchModules.bind(controller),
);

// GET /api/modules/:id - Get a single module by ID
moduleRoutes.get('/:id', controller.getModuleById.bind(controller));
/**
 * QUIZ ROUTES
 */

// GET /api/modules/:id/quiz - Get the quiz for a module
moduleRoutes.get(
  '/:id/quiz',
  authenticate,
  controller.getQuiz.bind(controller),
);

// POST /api/modules/:id/quiz-attempt - Submit a quiz
moduleRoutes.post(
  '/:id/quiz-attempt',
  authenticate,
  controller.handleQuizSubmission.bind(controller),
);

// GET /api/modules/:id/quiz-attempt - Get user attempt history
moduleRoutes.get(
  '/:id/quiz-attempt',
  authenticate,
  controller.getQuizAttemptsByUserAndQuizId.bind(controller),
);

export default moduleRoutes;
