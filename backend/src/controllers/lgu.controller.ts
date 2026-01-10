import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import PostModel from '../models/post.model.js';
import UserRepository from '../repositories/user.repository.js';
import LguService from '../services/lgu.service.js';

const MAX_SCORE_ITEMS = 10;

export default class LguController {
  private lguService = new LguService();
  private userService = new UserRepository();

  getLguAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lguId } = req.query;

      if (!lguId) {
        return res.status(400).json({ error: 'LGU ID is required' });
      }

      const objectIdLgu = new Types.ObjectId(lguId as string);

      // --- AGGREGATION 1: Go Bag Content Analysis ---
      // Counts how many posts contain specific item categories
      const itemBreakdown = await PostModel.aggregate([
        { $match: { lguId: objectIdLgu } },
        // Unwind the bagSnapshot array to treat each item as a document
        { $unwind: '$bagSnapshot' },
        // Group by item name (or category) and count occurrences
        {
          $group: {
            _id: '$bagSnapshot.name',
            count: { $sum: 1 },
          },
        },
        // Optional: Sort by count descending
        { $sort: { count: -1 } },
      ]);

      // Calculate total posts to determine percentage
      const totalPosts = await PostModel.countDocuments({ lguId: objectIdLgu });

      // Format item breakdown for frontend
      const formattedItems = itemBreakdown.map((item) => ({
        name: item._id,
        // Calculate percentage relative to total posts
        count: totalPosts > 0 ? Math.round((item.count / totalPosts) * 100) : 0,
        rawCount: item.count,
      }));

      // --- AGGREGATION 2: Readiness Distribution ---
      // Categorizes users based on their verifiedItemCount
      const readinessDistribution = await PostModel.aggregate([
        { $match: { lguId: objectIdLgu } },
        {
          $project: {
            // Calculate percentage score (capped at 100)
            score: {
              $min: [
                100,
                {
                  $multiply: [
                    { $divide: ['$verifiedItemCount', MAX_SCORE_ITEMS] },
                    100,
                  ],
                },
              ],
            },
          },
        },
        {
          $bucket: {
            groupBy: '$score',
            boundaries: [0, 40, 80, 101], // <40 (At Risk), 40-79 (Partial), 80-100 (Fully)
            default: 'Other',
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]);

      // Helper to extract count from bucket result
      const getCount = (min: number) =>
        readinessDistribution.find((b) => b._id === min)?.count || 0;

      const distribution = {
        fullyPrepared: getCount(80), // 80-100
        partiallyPrepared: getCount(40), // 40-79
        atRisk: getCount(0), // 0-39
        total: totalPosts,
      };

      res.json({
        itemBreakdown: formattedItems,
        distribution,
      });
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
      // 'req.user' comes from the authenticate middleware
      // It must contain the 'lguId' for LGU admins
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
}
