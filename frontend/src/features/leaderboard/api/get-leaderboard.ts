// frontend/src/features/leaderboard/api/get-leaderboard.ts
import type { GetLeaderboardQuery } from '@repo/shared/dist/schemas/user.schema';
import axios from 'axios';

type LeaderboardUser = {
  userId: string;
  name: string;
  avatarUrl?: string;
  points: {
    allTime: number;
    goBag: number;
  };
};

export const fetchLeaderboard = async (params: GetLeaderboardQuery) => {
  // axios handles the query string serialization automatically
  const { data } = await axios.get<LeaderboardUser[]>('/api/leaderboard', {
    params, 
  });
  return data;
};