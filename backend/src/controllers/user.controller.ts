import {
  GetLeaderboardQuerySchema,
  OnboardingRequestSchema,
  UpdateProfileInfoRequestSchema,
} from '@repo/shared/dist/schemas/user.schema';
import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import UserRepository from '../repositories/user.repository.js';
import UserService from '../services/user.service.js';
import { parseFileRequest } from '../utils/image.util.js';

export default class UserController {
  private userService = new UserService();

  complete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = OnboardingRequestSchema.parse(req.body);

      const userId = req.userId;

      const result = await this.userService.completeOnboarding(userId!, data);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * Updates the user's profile picture using Multer and Cloudinary.
   * Path: PATCH users/avatar
   */
  updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      // 1. FILE PARSING: Extract the image file from the multipart/form-data request
      const file = await parseFileRequest(req, res);

      // 2. SERVICE CALL: Service handles Cloudinary upload and DB URL update
      const result = await this.userService.updateAvatar(userId, file);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * Updates general profile fields (Email (?), Phone Number, Household info, Notifications).
   * Path: PATCH users/profile
   */
  updateProfileInfo = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.userId!;
      const updateData = UpdateProfileInfoRequestSchema.parse(req.body);

      const result = await this.userService.updateProfileInfo(
        userId!,
        updateData,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * Retrieves a list of top users filtered by location or specific point types.
   * Path: GET /api/users/leaderboard
   */
  getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const query = GetLeaderboardQuerySchema.parse(req.query);

      const users = await this.userService.getLeaderboard({
        userId,
        ...query,
      });

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * Retrieves the top 50 users globally ranked by totalPoints.
   * Path: GET /api/users/leaderboard/top
   */
  getTopLeaderboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 50;

      // Validate limit is within reasonable bounds
      const validatedLimit = Math.min(Math.max(limit, 1), 100);

      const result = await this.userService.getTopLeaderboard(validatedLimit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * Retrieves current user's completed modules and total points.
   * Path: GET /api/users/stats
   */
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const stats = await this.userService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * Retrieves quizzes the user has passed (best attempt >= minScore).
   * Path: GET /api/users/quizzes/completed
   */
  getCompletedQuizzes = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.userId!;
      const minScore = req.query.minScore
        ? Math.min(Math.max(parseInt(req.query.minScore as string, 10), 0), 100)
        : 70;

      const quizzes = await this.userService.getUserCompletedQuizzes(
        userId,
        minScore,
      );

      res.status(200).json({
        success: true,
        data: { quizzes },
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };
}
