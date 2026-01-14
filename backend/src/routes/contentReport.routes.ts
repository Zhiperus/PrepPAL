import { Router } from 'express';

import ContentReportController from '../controllers/contentReport.controller.js';
import {
  authenticate,
  authorizeRoles,
  ensureVerified,
} from '../middleware/auth.middleware.js';

const contentReportRoutes: Router = Router();
const controller = new ContentReportController();

contentReportRoutes.post(
  '/',
  authenticate,
  ensureVerified,
  controller.createContentReport.bind(controller),
);

contentReportRoutes.get(
  '/',
  authenticate,
  authorizeRoles('super_admin', 'lgu'),
  controller.findAllContentReports.bind(controller),
);

contentReportRoutes.patch(
  '/:id/complete',
  authenticate,
  authorizeRoles('super_admin', 'lgu'),
  controller.completeContentReport.bind(controller),
);

export default contentReportRoutes;
