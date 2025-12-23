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

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  //TODO: async logout(req: Request, res: Response, next: NextFunction)
  //
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await this.authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      const result = await this.authService.resetPassword(token, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
