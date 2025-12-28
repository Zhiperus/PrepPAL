import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import PostService from '../services/post.service.js';

export default class PostController {
  private postService = new PostService();

  // GET /api/posts
  getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sortBy, order } = req.query;

      const posts = await this.postService.getAllPosts({
        sortBy: sortBy as 'createdAt' | 'verificationCount' | 'verifiedItemCount',
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

  // POST /api/posts
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageUrl, caption } = req.body;
      const userId = req.userId!;

      const post = await this.postService.createPost({
        userId,
        imageUrl,
        caption,
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
