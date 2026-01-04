import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import ModuleService from '../services/module.service.js';

export default class ModuleController {
  private moduleService = new ModuleService();

  /**
   * GET /api/modules
   * Retrieves all modules with pagination.
   * Query params: page (default: 1), limit (default: 10)
   */
  getAllModules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { modules, total } = await this.moduleService.getAllModules({
        page,
        limit,
      });

      res.status(200).json({
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

      res.status(200).json({
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
          error: 'Search query parameter "q" is required',
        });
      }

      const { modules, total } = await this.moduleService.searchModules(query, {
        page,
        limit,
      });

      res.status(200).json({
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
}
