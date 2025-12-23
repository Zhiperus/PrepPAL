import { OnboardingRequestSchema } from '@repo/shared/dist/schemas/user.schema';
import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import UserService from '../services/user.service.js';

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
}
