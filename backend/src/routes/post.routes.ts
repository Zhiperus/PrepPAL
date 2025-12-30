import { Router } from 'express';

import PostController from '../controllers/post.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const postRoutes: Router = Router();
const controller = new PostController();

// GET /api/posts - Get all posts with optional sorting
postRoutes.get('/', controller.getAllPosts.bind(controller));

// POST /api/posts - Create a new post (authenticated)
postRoutes.post('/', authenticate, controller.createPost.bind(controller));

postRoutes.post(
  '/:postId/verify',
  authenticate,
  controller.verifyPost.bind(controller),
);

export default postRoutes;

