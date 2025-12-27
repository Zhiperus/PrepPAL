import { Router } from 'express';

import PostController from '../controllers/post.controller.js';

const postRoutes: Router = Router();
const controller = new PostController();

// GET /posts - Get all community posts with sort and pagination
// Query params: sortBy (date|averageScore), sortOrder (asc|desc), page, limit
postRoutes.get('/', controller.getCommunityPosts.bind(controller));

export default postRoutes;
