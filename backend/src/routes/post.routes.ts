import { Router } from 'express';

import PostController from '../controllers/post.controller.js';
import { authenticate, ensureVerified } from '../middleware/auth.middleware.js';

const postRoutes: Router = Router();
const controller = new PostController();

// GET /posts - Get all posts with optional sorting
postRoutes.get('/', controller.getAllPosts.bind(controller));

postRoutes.get(
  '/user/:userId',
  authenticate,
  controller.getUserPosts.bind(controller),
);

// POST /posts - Create a new post (authenticated)
postRoutes.post(
  '/',
  authenticate,
  ensureVerified,
  controller.createPost.bind(controller),
);

postRoutes.post(
  '/:postId/verify',
  authenticate,
  ensureVerified,
  controller.verifyPost.bind(controller),
);

export default postRoutes;
