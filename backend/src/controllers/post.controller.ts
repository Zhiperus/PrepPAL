import { NextFunction, Request, Response } from 'express';

import { BadRequestError, handleInternalError } from '../errors/index.js';
import PostService from '../services/post.service.js';
import { SortField, SortOrder } from '../repositories/post.repository.js';

export default class PostController {
  private postService = new PostService();

  getCommunityPosts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { sortBy, sortOrder, page, limit } = req.query;

      // Validate sortBy if provided
      const validSortFields: SortField[] = ['date', 'averageScore'];
      if (sortBy && !validSortFields.includes(sortBy as SortField)) {
        throw new BadRequestError(
          `Invalid sortBy value. Must be one of: ${validSortFields.join(', ')}`,
        );
      }

      // Validate sortOrder if provided
      const validSortOrders: SortOrder[] = ['asc', 'desc'];
      if (sortOrder && !validSortOrders.includes(sortOrder as SortOrder)) {
        throw new BadRequestError(
          `Invalid sortOrder value. Must be one of: ${validSortOrders.join(', ')}`,
        );
      }

      // Parse and validate pagination params
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;

      if (isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestError('Page must be a positive integer');
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestError('Limit must be an integer between 1 and 100');
      }

      const result = await this.postService.getPosts({
        sortBy: sortBy as SortField,
        sortOrder: sortOrder as SortOrder,
        page: pageNum,
        limit: limitNum,
      });

      res.json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };
}
