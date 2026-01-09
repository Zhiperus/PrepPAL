import { Router } from 'express';

import AdminController from '../controllers/admin.controller.js';
import {
    authenticate,
    authorizeRoles,
} from '../middleware/auth.middleware.js';

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

export default adminRoutes;
