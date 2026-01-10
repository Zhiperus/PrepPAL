import { moduleSchemaZod } from '@repo/shared/dist/schemas/module.schema';
import { quizAttemptSchema } from '@repo/shared/dist/schemas/quizAttempt.schema';
import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import ModuleService from '../services/module.service.js';
import QuizService from '../services/quiz.service.js';
import QuizAttemptService from '../services/quizAttempt.service.js';

export default class ModuleController {
  private moduleService = new ModuleService();
  private quizService = new QuizService();
  private quizAttemptService = new QuizAttemptService();

  /**
   * GET /api/modules
   * Retrieves all modules with pagination.
   * Query params: page (default: 1), limit (default: 10)
   */
  getAllModules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const userId = req.userId;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized' });
      }

      const { modules, total } = await this.moduleService.getAllModules(
        userId,
        {
          page,
          limit,
          search,
        },
      );

      res.status(200).json({
        success: true,
        data: modules,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * GET /api/modules/:id
   * Retrieves a single module by its ID.
   */
  getModuleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const module = await this.moduleService.getModuleById(id);

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
  };

  /**
   * GET /api/modules/search?q=...
   * Searches modules by title and description.
   * Query params: q (search query), page (default: 1), limit (default: 10)
   */
  searchModules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query parameter "q" is required',
        });
      }

      const userId = req.userId;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized' });
      }

      const { modules, total } = await this.moduleService.searchModules(
        userId,
        query,
        {
          page,
          limit,
        },
      );

      res.status(200).json({
        success: true,
        data: modules,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          query,
        },
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /* --- Quiz Related Methods --- */

  /**
   * POST /api/modules/:id/quiz/submit
   * Validates and grades a quiz attempt.
   */
  handleQuizSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
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
  };

  /**
   * GET /api/modules/:id/quiz/attempts
   * Returns the quiz attempt history for the user.
   */
  getQuizAttemptsByUserAndQuizId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
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
  };

  /**
   * GET /api/modules/:id/quiz
   * Retrieves the quiz associated with a module.
   */
  getQuiz = async (req: Request, res: Response, next: NextFunction) => {
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
  };

  /* --- Admin Endpoints --- */

  /**
   * POST /api/modules
   * Creates a new module.
   * Protected: super_admin
   */
  createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate input using Zod, omitting auto-generated fields
      const createSchema = moduleSchemaZod.omit({ _id: true, createdAt: true });
      const validatedData = createSchema.parse(req.body);

      const module = await this.moduleService.createModule(validatedData);

      res.status(201).json({
        success: true,
        data: module,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * PUT /api/modules/:id
   * Updates an existing module.
   * Protected: super_admin
   */
  updateModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // Partial updates allowed
      const updateSchema = moduleSchemaZod
        .omit({ _id: true, createdAt: true })
        .partial();
      const validatedData = updateSchema.parse(req.body);

      const updatedModule = await this.moduleService.updateModule(
        id,
        validatedData,
      );

      res.status(200).json({
        success: true,
        data: updatedModule,
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };

  /**
   * DELETE /api/modules/:id
   * Deletes a module.
   * Protected: super_admin
   */
  deleteModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.moduleService.deleteModule(id);

      res.status(200).json({
        success: true,
        message: 'Module deleted successfully',
      });
    } catch (err) {
      handleInternalError(err, next);
    }
  };
}
