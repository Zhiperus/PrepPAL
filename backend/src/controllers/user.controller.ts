import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors';
import UserService from '../services/user.service';

export default class UserController {
  private userService = new UserService();

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = await this.userService.getUserById(req.userId!);
      res.json({ data: userData });
    } catch (e) {
      handleInternalError(e, next);
    }
  };
}
