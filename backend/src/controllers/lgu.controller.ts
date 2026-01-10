import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import PostModel from '../models/post.model.js';
import UserRepository from '../repositories/user.repository.js';
import LguService from '../services/lgu.service.js';

export default class LguController {
  private lguService = new LguService();
  private userService = new UserRepository();

  getLguAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lguId } = req.query;
      if (!lguId) return res.status(400).json({ error: 'LGU ID is required' });
      const objectIdLgu = new Types.ObjectId(lguId as string);

      // 1. Get Denominator
      const totalPossibleItems = await GoBagItemModel.countDocuments();

      // 2. Main Aggregation for Distribution and Items
      const goBagStats = await GoBagModel.aggregate([
        // Join with Users to filter by LGU
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        { $match: { 'userDetails.lguId': objectIdLgu } },

        // Convert item strings to ObjectIds for the breakdown join
        {
          $addFields: {
            convertedItemIds: {
              $map: {
                input: { $ifNull: ['$items', []] },
                as: 'itemId',
                in: { $toObjectId: '$$itemId' },
              },
            },
          },
        },

        // Calculate the score for Distribution
        {
          $addFields: {
            itemsCount: { $size: '$convertedItemIds' },
            score: {
              $cond: [
                { $eq: [totalPossibleItems, 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        { $size: '$convertedItemIds' },
                        totalPossibleItems,
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
        },
      ]);

      // 3. Separate Aggregation for Item Breakdown (Percentage of citizens who have X item)
      const itemBreakdown = await GoBagModel.aggregate([
        // 1. Filter by LGU residents first
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        { $match: { 'userDetails.lguId': objectIdLgu } },

        // 2. IMPORTANT: Convert the strings in 'items' to ObjectIds
        {
          $project: {
            convertedItems: {
              $map: {
                input: { $ifNull: ['$items', []] },
                as: 'itemId',
                in: { $toObjectId: '$$itemId' }, // Converts the String to ObjectId
              },
            },
          },
        },

        // 3. Flatten the converted items array
        { $unwind: '$convertedItems' },

        // 4. Group by the actual ObjectId
        {
          $group: {
            _id: '$convertedItems',
            count: { $sum: 1 },
          },
        },

        // 5. Now the lookup will work because _id is an ObjectId
        {
          $lookup: {
            from: 'gobagitems',
            localField: '_id',
            foreignField: '_id',
            as: 'details',
          },
        },
        { $unwind: '$details' },
        {
          $project: {
            name: '$details.name',
            rawCount: '$count',
            count: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$count', goBagStats.length || 1] },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
        { $sort: { rawCount: -1 } },
      ]);
      // 4. Process Distribution Buckets
      let fullyPrepared = 0;
      let partiallyPrepared = 0;
      let atRisk = 0;

      goBagStats.forEach((bag) => {
        if (bag.score >= 80) fullyPrepared++;
        else if (bag.score >= 40) partiallyPrepared++;
        else atRisk++;
      });

      res.json({
        itemBreakdown,
        distribution: {
          fullyPrepared,
          partiallyPrepared,
          atRisk,
          total: goBagStats.length,
        },
      });
    } catch (error) {
      console.error('Analytics Error:', error);
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

  getLguResidentGoBags = async (req: Request, res: Response) => {
    try {
      const { lguId } = req.query;

      if (!lguId) {
        return res.status(400).json({ error: 'LGU ID is required' });
      }

      // 1. Get the total count of official Go Bag Items to act as the denominator
      const totalPossibleItems = await GoBagItemModel.countDocuments();

      const goBags = await GoBagModel.aggregate([
        // 2. Join with Users
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },

        // 3. Filter by LGU
        {
          $match: {
            'userDetails.lguId': new Types.ObjectId(lguId as string),
          },
        },

        // 4. Convert Item Strings to ObjectIds
        {
          $addFields: {
            convertedItemIds: {
              $map: {
                input: '$items',
                as: 'itemId',
                in: { $toObjectId: '$$itemId' },
              },
            },
          },
        },

        // 5. Lookup Item Details
        {
          $lookup: {
            from: 'gobagitems',
            localField: 'convertedItemIds',
            foreignField: '_id',
            as: 'itemDetails',
          },
        },

        // 6. Projection & Calculation
        {
          $project: {
            _id: 1,
            imageUrl: 1,
            lastUpdated: 1,

            // --- NEW: Calculate Completeness % ---
            completeness: {
              $cond: {
                if: { $eq: [totalPossibleItems, 0] }, // Prevent divide by zero
                then: 0,
                else: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $size: '$itemDetails' },
                            totalPossibleItems,
                          ],
                        },
                        100,
                      ],
                    },
                    0, // Round to nearest integer
                  ],
                },
              },
            },

            userId: {
              _id: '$userDetails._id',
              householdName: '$userDetails.householdName',
              email: '$userDetails.email',
              phoneNumber: '$userDetails.phoneNumber',
              location: '$userDetails.location',
              householdInfo: '$userDetails.householdInfo',
              points: '$userDetails.points', // We keep points for other metrics if needed
              profileImage: '$userDetails.profileImage',
            },
            items: {
              $map: {
                input: '$itemDetails',
                as: 'item',
                in: {
                  _id: '$$item._id',
                  name: '$$item.name',
                  category: '$$item.category',
                  defaultQuantity: { $ifNull: ['$$item.defaultQuantity', 1] },
                },
              },
            },
          },
        },

        // 7. Sort
        { $sort: { lastUpdated: -1 } },
      ]);

      return res.status(200).json(goBags);
    } catch (error) {
      console.error('Error fetching LGU Go Bags:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
