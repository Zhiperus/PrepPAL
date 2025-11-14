import { NextFunction, Request, Response } from 'express';

import AuthService from '../services/auth.service';

export default class AuthController {
  private authService = new AuthService();
  //TODO: async signup(req: Request, res: Response, next: NextFunction)

  //TODO: async login(req: Request, res: Response, next: NextFunction)

  //TODO: async logout(req: Request, res: Response, next: NextFunction)
}
