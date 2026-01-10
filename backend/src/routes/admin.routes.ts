import { Router } from 'express';

import AdminController from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const adminRoutes: Router = Router();
const controller = new AdminController();

/**
 * GET /admin/stats
 * Returns aggregated dashboard statistics
 * Protected: Requires authentication and super_admin role
 */
adminRoutes.get(
  '/stats',
  authenticate,
  authorizeRoles('super_admin'),
  controller.getDashboardStats.bind(controller),
);

adminRoutes.get(
  '/lgus',
  authenticate,
  authorizeRoles('super_admin'),
  controller.getLgus.bind(controller),
);

adminRoutes.post(
  '/lgus',
  authenticate,
  authorizeRoles('super_admin'),
  controller.createLgu.bind(controller),
);

adminRoutes.patch(
  '/lgus/:lguId',
  authenticate,
  authorizeRoles('super_admin'),
  controller.updateLgu.bind(controller),
);

export default adminRoutes;
