import { quizSchemaZod } from '@repo/shared/dist/schemas/quiz.schema';
import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import QuizService from '../services/quiz.service.js';

export default class QuizController {
  private quizService = new QuizService();

  /**
   * POST /api/quizzes
   * Creates a new quiz.
   * Protected: super_admin
   */
  createQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createSchema = quizSchemaZod.omit({ _id: true });
      const validatedData = createSchema.parse(req.body);

      const quiz = await this.quizService.createQuiz(validatedData);

      res.status(201).json({
        success: true,
        data: quiz,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * PUT /api/quizzes/:id
   * Updates an existing quiz.
   * Protected: super_admin
   */
  updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateSchema = quizSchemaZod
        .omit({ _id: true, moduleId: true })
        .partial();
      const validatedData = updateSchema.parse(req.body);

      const updatedQuiz = await this.quizService.updateQuiz(id, validatedData);

      res.status(200).json({
        success: true,
        data: updatedQuiz,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * DELETE /api/quizzes/:id
   * Deletes a quiz.
   * Protected: super_admin
   */
  deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.quizService.deleteQuiz(id);

      res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully',
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };
}
