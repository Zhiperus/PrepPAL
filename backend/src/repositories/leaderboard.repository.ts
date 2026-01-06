import type { LeaderboardEntry } from '@repo/shared/dist/schemas/leaderboard.schema';
import { PipelineStage } from 'mongoose';

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
}
