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
      console.log(updateData);

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
}
