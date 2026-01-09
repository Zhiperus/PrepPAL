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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: 'citizen' | 'lgu' | 'super_admin';
      lguId: string;
    };

    // attach the userId to the request object for downstream handlers
    req.userId = decoded.userId;
    req.role = decoded.role;
    req.lguId = decoded.lguId;

    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid token.'));
  }
};

export const authorizeRoles = (
  ...allowedRoles: ('citizen' | 'lgu' | 'super_admin')[]
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    console.log(req.role);
    if (!req.role) {
      return next(new UnauthorizedError('User role not identified'));
    }

    if (!allowedRoles.includes(req.role!)) {
      return next(
        new UnauthorizedError(
          `Access Denied. Your role (${req.role}) is not authorized.`,
        ),
      );
    }
    next();
  };
};

export const authorizeLguScope = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // 1. Super admins are "God Mode" - they bypass all scoping
  if (req.role === 'super_admin') return next();

  // 2. If they aren't a super_admin, they MUST have an LGU ID
  if (!req.lguId) {
    return next(
      new UnauthorizedError('User is not assigned to any LGU scope.'),
    );
  }

  // 3. Logic: If the request has an lguId param (e.g. /reports/:lguId),
  // verify it matches the user's lguId.
  const targetLguId = req.params.lguId || req.query.lguId || req.body.lguId;

  if (targetLguId && targetLguId !== req.lguId) {
    return next(
      new UnauthorizedError(
        'Access Denied: You cannot access data outside your LGU.',
      ),
    );
  }

  next();
};
