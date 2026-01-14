import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '../errors/index.js';
import UserModel from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT-SECRET';

interface JWTPayload {
  userId: string;
  role: 'citizen' | 'lgu' | 'super_admin';
  cityCode?: string; // Made optional because super_admin might not have one
  barangayCode?: string; // Made optional because super_admin might not have one
}

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
    // 2. VERIFY & DECODE
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // 3. ATTACH CONTEXT TO REQUEST
    req.userId = decoded.userId;
    req.role = decoded.role;

    req.cityCode = decoded.cityCode;
    req.barangayCode = decoded.barangayCode;

    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid token.'));
  }
};

export const authorizeRoles = (
  ...allowedRoles: ('citizen' | 'lgu' | 'super_admin')[]
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
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

/**
 * Ensures the user can only touch data within their own Barangay/City.
 */
export const authorizeLocationScope = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // 1. Super admins bypass all scoping
  if (req.role === 'super_admin') return next();

  // 2. Regular users MUST have location codes in their token
  if (!req.barangayCode || !req.cityCode) {
    return next(
      new UnauthorizedError('User is not assigned to a valid location scope.'),
    );
  }

  // 3. Check for "Target" codes in Params, Query, or Body
  // We prioritize checking barangayCode as it is the most specific scope
  const targetBarangayCode =
    req.params.barangayCode || req.query.barangayCode || req.body.barangayCode;

  const targetCityCode =
    req.params.cityCode || req.query.cityCode || req.body.cityCode;

  // 4. BARANGAY LEVEL LOCK:
  // If the request targets a specific barangay, it MUST match the user's barangay.
  if (targetBarangayCode && targetBarangayCode !== req.barangayCode) {
    return next(
      new UnauthorizedError(
        `Access Denied: You cannot access data for Barangay Code ${targetBarangayCode}.`,
      ),
    );
  }

  // 5. CITY LEVEL LOCK (Optional safety net):
  // If the request targets a specific city, it MUST match the user's city.
  if (targetCityCode && targetCityCode !== req.cityCode) {
    return next(
      new UnauthorizedError(
        `Access Denied: You cannot access data for City Code ${targetCityCode}.`,
      ),
    );
  }

  next();
};

export const ensureVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. verifyToken middleware has already run, so we have req.user.userId
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await UserModel.findById(req.userId).select('isEmailVerified');

    if (!user || !user.isEmailVerified) {
      return res.status(403).json({
        message: 'Email verification required',
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during verification check' });
  }
};
