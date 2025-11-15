import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from '@shared/schemas/auth.schema';
import express from 'express';
import { ZodType, ZodError } from 'zod';

import { BadRequestError, InternalServerError } from '../errors';

const validators: Record<string, ZodType> = {
  login: LoginRequestSchema,
  register: RegisterRequestSchema,
};

type ValidatorName = keyof typeof validators;

export const validateAuth = (schemaName: ValidatorName) => {
  const schema = validators[schemaName];

  if (!schema) {
    throw new InternalServerError(`Validator "${schemaName}" does not exist.`);
  }

  return (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues.map((issue) => issue.message).join(', ');
        return next(new BadRequestError(message));
      }

      return next(new InternalServerError());
    }
  };
};
