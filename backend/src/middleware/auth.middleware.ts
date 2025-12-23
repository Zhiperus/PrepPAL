import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '../errors/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT-SECRET';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.header('Authorization')?.slice(7);

  if (!token) {
    return next(new UnauthorizedError('Access denied. No token provided.'));
  }

  try {
    // verify the token and decode the payload
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // attach the userId to the request object for downstream handlers
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid token.'));
  }
};
