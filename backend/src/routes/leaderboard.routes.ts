import { Router } from 'express';

import LeaderboardController from '../controllers/leaderboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const leaderboardRoutes: Router = Router();
const controller = new LeaderboardController();

// GET /leaderboard?barangay=Batasan&limit=50
leaderboardRoutes.get(
  '/',
  authenticate,
  controller.getLeaderboard.bind(controller),
);

export default leaderboardRoutes;
