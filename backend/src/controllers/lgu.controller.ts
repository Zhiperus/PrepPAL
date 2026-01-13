import { NextFunction, Request, Response } from 'express';

import LguService from '../services/lgu.service.js';
import UserService from '../services/user.service.js';

export default class LguController {
  private lguService = new LguService();
  private userService = new UserService();

  getLguAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lguId } = req.query;
      if (!lguId) return res.status(400).json({ error: 'LGU ID is required' });

      const analytics = await this.lguService.getLguAnalytics(lguId as string);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  };

  getDashboardMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.userId;
      const user = await this.userService.findById(userId!);

      if (!user?.lguId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with a specific LGU.',
        });
      }

      const metrics = await this.lguService.getDashboardMetrics(user.lguId);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  getLguResidentGoBags = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { lguId, page = 1, limit = 10 } = req.query;
      if (!lguId) return res.status(400).json({ error: 'LGU ID is required' });

      const { data, total } = await this.lguService.getResidentGoBags(
        lguId as string,
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
