import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import PostService from '../services/post.service.js';
import { parseFileRequest } from '../utils/image.util.js';

export default class PostController {
  private postService = new PostService();

  verifyPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const { verifiedItemIds } = req.body;
      const raterUserId = req.userId!;

      const verifiedData = await this.postService.verifyPostItems({
        raterUserId,
        postId,
        verifiedItemIds,
      });
      res.json({ data: verifiedData });
    } catch (e) {
      handleInternalError(e, next);
    }
  };

  /**
   * GET /api/posts
   * Retrieves all posts with optional sorting via query params.
   * Query params: sortBy (createdAt|verificationCount|verifiedItemCount), order (asc|desc)
   */
  // Inside PostController class...

  getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { sortBy, order, search } = req.query;

      const { posts, total } = await this.postService.getAllPosts({
        page,
        limit,
        search: search as string,
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      });

      const formattedPosts = posts.map((post: any) => {
        const user = post.userId || {};

        const points = user.points?.goBag || 0;
        const rank = Math.floor(points / 50) + 1;

        return {
          ...post,
          _id: post._id.toString(),
          userId: user._id?.toString(), // Ensure we handle the object safely
          author: {
            name: user.householdName || 'Unknown',
            userImage: user.profileImage,
            rank: rank,
          },
        };
      });

      res.status(200).json({
        data: formattedPosts,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * GET /posts/user/:userId
   * Retrieves all posts for a specific user.
   */
  getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { sortBy, order } = req.query;

      const { posts, total } = await this.postService.getUserPosts(userId, {
        page,
        limit,
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      });

      res.status(200).json({
        data: posts,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
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
      const { caption } = req.body;

      const post = await this.postService.createPost({
        userId,
        file,
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
