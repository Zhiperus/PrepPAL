import { Router } from 'express';

import authRoutes from './auth.routes.js';
import contentReportRoutes from './contentReport.routes.js';
import goBagRoutes from './goBag.routes.js';
import goBagItemRoutes from './goBagItem.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';
import moduleRoutes from './module.routes.js';
import postRoutes from './post.routes.js';
import quizRoutes from './quiz.routes.js';
import quizAttemptRoutes from './quizAttempt.routes.js';
import ratingRoutes from './rating.routes.js';
import userRoutes from './user.routes.js';

type Route = {
  path: string;
  router: Router;
};

const routes: Route[] = [
  { path: '/auth', router: authRoutes },
  { path: '/users', router: userRoutes },
  { path: '/leaderboard', router: leaderboardRoutes },
  { path: '/goBags', router: goBagRoutes },
  { path: '/items', router: goBagItemRoutes },
  { path: '/modules', router: moduleRoutes },
  { path: '/posts', router: postRoutes },
  { path: '/quiz', router: quizRoutes },
  { path: '/quiz-attempt', router: quizAttemptRoutes },
  { path: '/ratings', router: ratingRoutes },
  { path: '/reports', router: contentReportRoutes },
];

export default routes;
