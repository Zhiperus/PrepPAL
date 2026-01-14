import { Router } from 'express';

import QuestionReportController from '../controllers/questionReport.controller.js';
import {
  authenticate,
  authorizeRoles,
  ensureVerified,
} from '../middleware/auth.middleware.js';

const questionReportRoutes: Router = Router();
const controller = new QuestionReportController();

questionReportRoutes.post(
  '/',
  authenticate,
  ensureVerified,
  controller.createQuestionReport.bind(controller),
);

questionReportRoutes.get(
  '/',
  authenticate,
  authorizeRoles('super_admin'),
  controller.findAllQuestionReports.bind(controller),
);

questionReportRoutes.patch(
  '/:id/complete',
  authenticate,
  authorizeRoles('super_admin'),
  controller.completeQuestionReport.bind(controller),
);

export default questionReportRoutes;
