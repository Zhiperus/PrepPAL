import { quizAttemptSchema } from '@repo/shared/dist/schemas/quizAttempt.schema';
import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import ModuleService from '../services/module.service.js';
import QuizService from '../services/quiz.service.js';
import QuizAttemptService from '../services/quizAttempt.service.js';

export default class ModuleController {
  private moduleService = new ModuleService();
  private quizAttemptService = new QuizAttemptService();
  private quizService = new QuizService();

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

      res.status(200).json({ success: true, data: result });
    } catch (e) {
      handleInternalError(e, next);
    }
  }

  /** 
  Returns the quiz attempt history for that module
  */
  async getQuizAttemptsByUserAndQuizId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id: moduleId } = req.params;
      const userId = req.userId;

      const quiz = await this.quizService.getQuiz(moduleId);

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found for the provided module ID',
        });
      }

      const attempts =
        await this.quizAttemptService.getQuizAttemptsByUserAndQuizId(
          userId!,
          quiz.id,
        );

      res.status(200).json({
        success: true,
        data: attempts,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  }

  async getQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: moduleId } = req.params;
      const quiz = await this.quizService.getQuiz(moduleId);

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found for the provided module ID',
        });
      }

      res.status(200).json({
        success: true,
        data: quiz,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  }

  async getAllModules(req: Request, res: Response, next: NextFunction) {
    try {
      const modules = await this.moduleService.getAllModules();

      res.status(200).json({
        success: true,
        data: modules,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  }

  async getModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const module = await this.moduleService.getModule(id);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found',
        });
      }
      res.status(200).json({
        success: true,
        data: module,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  }
}
