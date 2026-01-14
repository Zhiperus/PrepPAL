import { NextFunction, Request, Response } from 'express';

import LeaderboardService from '../services/leaderboard.service.js';

// Define the expected query parameters
interface LeaderboardQuery {
  barangayCode?: string;
  limit?: string;
  search?: string;
  metric?: 'allTime' | 'goBag';
}

export default class LeaderboardController {
  private leaderboardService = new LeaderboardService();

  getLeaderboard = async (
    req: Request<unknown, unknown, unknown, LeaderboardQuery>, // Typed Request Query
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { barangayCode, limit, search, metric } = req.query;

      const result = await this.leaderboardService.getLeaderboard({
        barangayCode,
        limit,
        search,
        metric,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
