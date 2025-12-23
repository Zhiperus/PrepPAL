import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors';
import AuthService from '../services/auth.service';

export default class AuthController {
  private authService = new AuthService();

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = await this.authService.getUserById(req.userId!);
      res.json({ data: userData });
    } catch (e) {
      handleInternalError(e, next);
    }
  };

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.signup(req.body);

      res.status(201).json({
        success: true,
        data: result,
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

  sendVerificationEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.authService.sendVerificationEmail(req.userId!);

      res.status(200).json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (e) {
      handleInternalError(e, next);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: 'Token is required' });
      }

      const user = await this.authService.verifyEmailToken(token);

      res.status(200).json({
        success: true,
        message: 'Email successfully verified',
        user,
      });
    } catch (e) {
      handleInternalError(e, next);
    }
  };

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
