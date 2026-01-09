import type { LeaderboardEntry } from '@repo/shared/dist/schemas/leaderboard.schema';
import { PipelineStage, Types } from 'mongoose';

import UserModel from '../models/user.model.js';

export default class LeaderboardRepository {
  async getAggregatedLeaderboard({
    barangay,
    limit,
    search,
    metric = 'allTime',
  }: {
    barangay?: string;
    limit: number;
    search?: string;
    metric?: 'allTime' | 'goBag';
  }): Promise<LeaderboardEntry[]> {
    const pipeline: PipelineStage[] = [];

    // 1. MATCH STAGE
    const matchStage: Record<string, unknown> = { role: 'citizen' };
    if (barangay) {
      matchStage['location.barangay'] = { $regex: new RegExp(barangay, 'i') };
    }
    pipeline.push({ $match: matchStage });

    // 2. ADD FIELDS
    pipeline.push({
      $addFields: {
        totalPoints: {
          $add: [
            { $ifNull: ['$points.goBag', 0] },
            { $ifNull: ['$points.modules', 0] },
            { $ifNull: ['$points.community', 0] },
          ],
        },
      },
    });

    // 3. RANKING STAGE (Dynamic Sort)
    // If metric is 'goBag', we rank by 'points.goBag'. Otherwise 'totalPoints'.
    const sortField = metric === 'goBag' ? 'points.goBag' : 'totalPoints';

    pipeline.push({
      $setWindowFields: {
        partitionBy: null,
        sortBy: { [sortField]: -1 },
        output: {
          rank: {
            $denseRank: {},
          },
        },
      },
    });

    // 4. SEARCH MATCH
    if (search) {
      pipeline.push({
        $match: {
          householdName: { $regex: new RegExp(search, 'i') },
        },
      });
    }

    // 5. SORT Output by Rank
    pipeline.push({ $sort: { rank: 1 } });

    // 6. LIMIT
    if (!search) {
      pipeline.push({ $limit: limit });
    }

    // 7. PROJECT
    pipeline.push({
      $project: {
        _id: 1,
        rank: 1,
        householdName: 1,
        profileImage: 1,
        totalPoints: 1,
        points: 1,
        location: 1,
      },
    });

    return UserModel.aggregate<LeaderboardEntry>(pipeline);
  }

  async getUserRanks(userIds: string[]): Promise<Map<string, number>> {
    if (userIds.length === 0) return new Map();

    const objectIds = userIds.map((id) => new Types.ObjectId(id));

    const pipeline: PipelineStage[] = [
      // 1. MATCH: Only look at citizens (same as leaderboard)
      { $match: { role: 'citizen' } },

      // 2. CALCULATE SCORE: Same totalPoints logic as main leaderboard
      {
        $addFields: {
          totalPoints: {
            $add: [
              { $ifNull: ['$points.goBag', 0] },
              { $ifNull: ['$points.modules', 0] },
              { $ifNull: ['$points.community', 0] },
            ],
          },
        },
      },

      // 3. RANK: Calculate rank for EVERYONE first
      {
        $setWindowFields: {
          partitionBy: null,
          sortBy: { totalPoints: -1 },
          output: {
            rank: { $denseRank: {} },
          },
        },
      },

      // 4. FILTER: Keep only the users we requested
      // We do this AFTER ranking, so the rank number is still accurate globally
      {
        $match: {
          _id: { $in: objectIds },
        },
      },

      // 5. PROJECT: We only need ID and Rank
      {
        $project: {
          _id: 1,
          rank: 1,
        },
      },
    ];

    const results = await UserModel.aggregate<{
      _id: Types.ObjectId;
      rank: number;
    }>(pipeline);

    // Convert to a Map for O(1) lookup:  "userId" -> rank
    return new Map(results.map((r) => [r._id.toString(), r.rank]));
  }
}
