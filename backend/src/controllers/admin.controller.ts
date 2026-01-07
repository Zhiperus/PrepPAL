import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import AdminService from '../services/admin.service.js';

export default class AdminController {
    private adminService = new AdminService();

    /**
     * Get dashboard statistics for admin panel
     * Path: GET /admin/stats
     * Access: Protected - super_admin only
     */
    getDashboardStats = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const stats = await this.adminService.getDashboardStats();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (err) {
            handleInternalError(err, next);
        }
    };
}
