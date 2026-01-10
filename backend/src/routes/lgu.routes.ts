import { Router } from 'express';

import LguController from '../controllers/lgu.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const lguRoutes: Router = Router();
const controller = new LguController();

// GET /lgu/dashboard-metrics
lguRoutes.get(
  '/dashboard-metrics',
  authenticate,
  authorizeRoles('lgu'), // Only LGU admins
  controller.getDashboardMetrics.bind(controller),
);

lguRoutes.get(
  '/go-bag-analytics',
  authenticate,
  authorizeRoles('lgu'),
  controller.getLguAnalytics.bind(controller),
);

lguRoutes.get(
  '/go-bags',
  authenticate,
  authorizeRoles('lgu'),
  controller.getLguResidentGoBags.bind(controller),
);

export default lguRoutes;
