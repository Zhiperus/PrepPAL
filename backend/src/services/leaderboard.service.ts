import type { LeaderboardEntry } from '@repo/shared/dist/schemas/leaderboard.schema';

import LeaderboardRepository from '../repositories/leaderboard.repository.js';

interface GetLeaderboardParams {
  barangayCode?: string;
  limit?: string | number; // Controller might pass a string from req.query
  search?: string;
  metric?: 'allTime' | 'goBag';
}

export default class LeaderboardService {
  private leaderboardRepo = new LeaderboardRepository();

  async getLeaderboard({
    barangayCode,
    limit,
    search,
    metric,
  }: GetLeaderboardParams): Promise<LeaderboardEntry[]> {
    // strict parsing: ensure we pass a number to the repo
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

    // Fallback to 20 if parsing fails or limit is undefined
    const finalLimit = parsedLimit && !isNaN(parsedLimit) ? parsedLimit : 20;

    const data = await this.leaderboardRepo.getAggregatedLeaderboard({
      barangayCode,
      limit: finalLimit,
      search,
      metric,
    });

    return data;
  }
}
