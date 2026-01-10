import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import LeaderboardRepository from '../repositories/leaderboard.repository.js';
import PostService from '../services/post.service.js';

export default class PostController {
  private postService = new PostService();
  private leaderboardRepo = new LeaderboardRepository();

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

      // 1. Fetch Posts
      const { posts, total } = await this.postService.getAllPosts({
        page,
        limit,
        search: search as string,
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      });

      // 2. Extract Unique User IDs from the current page of posts
      // We filter out null/undefined users just in case
      const userIds = [
        ...new Set(
          posts
            .map((post: any) => post.userId?._id?.toString())
            .filter((id: string): id is string => !!id),
        ),
      ] as string[];
      // 3. Get Actual Ranks for these users
      // This calculates their global standing dynamically
      const rankMap = await this.leaderboardRepo.getUserRanks(userIds);

      // 4. Map Ranks back to Posts
      const formattedPosts = posts.map((post: any) => {
        const user = post.userId || {};
        const userIdString = user._id?.toString();

        // Get the real rank from our map, or default to 0/null if not found
        const actualRank = rankMap.get(userIdString) || 0;

        return {
          ...post,
          _id: post._id.toString(),
          userId: userIdString,
          author: {
            name: user.householdName || 'Unknown',
            userImage: user.profileImage,
            rank: actualRank, // <--- Now uses the real DB rank
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
   * Uses the user's stored go bag image (snapshot) and accepts a caption.
   * Automatically snapshots the user's current GoBag items into the post.
   */
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { caption } = req.body;

      const post = await this.postService.createPost({
        userId,
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
