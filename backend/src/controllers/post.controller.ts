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
      // 1. Extract Query Params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { sortBy, order, search } = req.query;

      // 2. Call Service
      const { posts, total } = await this.postService.getAllPosts({
        page,
        limit,
        search: search as string,
        sortBy: sortBy as
          | 'createdAt'
          | 'verificationCount'
          | 'verifiedItemCount',
        order: order as 'asc' | 'desc',
      });

      // 3. Format Authors & Rank (Match FeedPostSchema)
      const formattedPosts = posts.map((post: any) => {
        const points = post.userId?.points?.goBag || 0;
        const rank = Math.floor(points / 50) + 1; // Example rank logic

        return {
          ...post,
          _id: post._id.toString(), // Ensure ID is string
          userId: post.userId?._id.toString(),
          author: {
            name: post.userId?.householdName || 'Unknown',
            userImage: post.userId?.profileImage,
            rank: rank,
          },
        };
      });

      // 4. Send Response with Meta
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
