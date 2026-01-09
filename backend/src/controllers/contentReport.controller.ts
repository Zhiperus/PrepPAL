import {
  CompleteReportRequestSchema,
  GetReportsQuery,
  GetReportsQuerySchema,
} from '@repo/shared/dist/schemas/contentReport.schema';
import { NextFunction, Request, Response } from 'express';

import ContentReportService from '../services/contentReport.service.js';

export default class ContentReportController {
  private reportService = new ContentReportService();

  findAllReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Validate the query (sortBy, order, limit, page)
      const validatedQuery = GetReportsQuerySchema.parse(req.query);

      // 2. Determine the correct lguId scope
      // Super admins can see everything or filter by a specific LGU from query
      // Regular users are locked to their own req.lguId
      const targetLguId =
        req.role === 'super_admin' ? validatedQuery.lguId : req.lguId;

      // 3. Construct the final filters object
      const filters: GetReportsQuery = {
        ...validatedQuery,
        lguId: targetLguId ?? undefined, // Ensure null becomes undefined
      };

      const result = await this.reportService.findAll(filters);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  completeReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const validatedData = CompleteReportRequestSchema.parse(req.body);

      const result = await this.reportService.completeReport(id, validatedData);
      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  };
}
