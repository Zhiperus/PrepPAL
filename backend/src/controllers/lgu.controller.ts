import { NextFunction, Request, Response } from 'express';

import LguService from '../services/lgu.service.js';

export default class LguController {
  private lguService = new LguService();

  deleteLgu = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params; // Expecting /lgus/:id

      await this.lguService.delete(id);

      res.status(200).json({
        success: true,
        message: 'LGU Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // 1. ANALYTICS (Public or Shared)
  getLguAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // We now query by Code, not ID
      const { barangayCode } = req.query;

      if (!barangayCode) {
        return res.status(400).json({ error: 'Barangay Code is required' });
      }

      const analytics = await this.lguService.getLguAnalytics(
        barangayCode as string,
      );
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };

  // 2. DASHBOARD (Protected - LGU Admin Only)
  getDashboardMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // The middleware (authorizeLocationScope) now guarantees these exist
      const { cityCode, barangayCode } = req;

      if (!cityCode || !barangayCode) {
        return res.status(400).json({
          success: false,
          message: 'User session missing location scope.',
        });
      }

      const metrics = await this.lguService.getDashboardMetrics(
        cityCode,
        barangayCode,
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  // 3. RESIDENT LIST (Protected)
  getLguResidentGoBags = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { barangayCode, page = 1, limit = 10 } = req.query;

      if (!barangayCode) {
        return res.status(400).json({ error: 'Barangay Code is required' });
      }

      const { data, total } = await this.lguService.getResidentGoBags(
        barangayCode as string,
        Number(page),
        Number(limit),
      );

      res.status(200).json({
        data,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
