import { NextFunction } from 'express';

export class InternalServerError extends Error {
  statusCode: number;
  constructor(message: string = 'Internal Server Error') {
    super(message);
    this.statusCode = 500;
  }
}

export class NotFoundError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

// Handle unexpected errors in controllers
export const handleInternalError = (err: unknown, next: NextFunction) => {
  console.error(err); // optional logging
  if (err instanceof Error && 'statusCode' in err) {
    return next(err);
  }
  return next(new InternalServerError());
};
