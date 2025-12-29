import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import PostService from '../services/post.service.js';
import { parseFileRequest } from '../utils/image.util.js';


export default class PostController {
  private postService = new PostService();

  /**
   * GET /api/posts
   * Retrieves all posts with optional sorting via query params.
   * Query params: sortBy (createdAt|verificationCount|verifiedItemCount), order (asc|desc)
   */
  getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sortBy, order } = req.query;

      const posts = await this.postService.getAllPosts({
        sortBy: sortBy as
          | 'createdAt'
          | 'verificationCount'
          | 'verifiedItemCount',
        order: order as 'asc' | 'desc',
      });

      res.status(200).json({
        success: true,
        data: { posts },
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * POST /api/posts
   * Creates a new post for the authenticated user.
   * Expects multipart/form-data with an 'image' file field.
   * Automatically snapshots the user's current GoBag items into the post.
   */
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const file = await parseFileRequest(req, res);

      const post = await this.postService.createPost({
        userId,
        file,
      });

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };
}