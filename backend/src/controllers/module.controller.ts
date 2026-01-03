import { quizAttemptSchema } from '@repo/shared/dist/schemas/quizAttempt.schema';
import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import ModuleService from '../services/module.service.js';
import QuizAttemptService from '../services/quizAttempt.service.js';

export default class ModuleController {
  private moduleService = new ModuleService();
  private quizAttemptService = new QuizAttemptService();

  async handleQuizSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = quizAttemptSchema.parse(req.body);

      const { id: moduleId } = req.params;
      const userId = req.userId;

      const result = await this.quizAttemptService.gradeAttempt(
        userId!,
        moduleId,
        validatedInput.answers,
      );

      res.json({ data: result });
    } catch (e) {
      handleInternalError(e, next);
    }
  }

  async getQuizAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: moduleId } = req.params;
      const userId = req.userId;

      const attempts = await this.quizAttemptService.getQuizAttempts(
        userId!,
        moduleId,
      );

      res.status(200).json({
        data: attempts,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  }
}
