import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors';
import AuthService from '../services/auth.service';

export default class AuthController {
  private authService = new AuthService();

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.signup(req.body);

      res.status(201).json({
        success: true,
        data: { id: user._id, email: user.email },
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  //TODO: async login(req: Request, res: Response, next: NextFunction)

  //TODO: async logout(req: Request, res: Response, next: NextFunction)
}
