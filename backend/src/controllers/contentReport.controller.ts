import {
  CompleteContentReportRequestSchema,
  GetContentReportsQuerySchema,
  GetContentReportsQuery,
  CreateContentReportSchema,
} from '@repo/shared/dist/schemas/contentReport.schema';
import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import ContentReportService from '../services/contentReport.service.js';

export default class ContentReportController {
  private reportService = new ContentReportService();

  createContentReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = CreateContentReportSchema.parse(req.body);

      // Get the ID of the user reporting
      const reporterId = req.userId;

      const report = await this.reportService.create({
        ...data,
        reporterId: reporterId as string,
        status: 'PENDING',
      });

      res.status(201).json({ success: true, data: report });
    } catch (error) {
      handleInternalError(error, next);
    }
  };

  findAllContentReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. Validate the query (sortBy, order, limit, page)
      const validatedQuery = GetContentReportsQuerySchema.parse(req.query);

      // 2. Determine the correct location scope
      // Super admins can see everything or filter by a specific LGU from query
      // Regular users are locked to their own req.barangayCode
      const targetCode =
        req.role === 'super_admin'
          ? validatedQuery.barangayCode
          : req.barangayCode;

      // 3. Construct the final filters object
      const filters: GetContentReportsQuery = {
        ...validatedQuery,
        // Ensure null becomes undefined to avoid database query issues
        barangayCode: targetCode ?? undefined,
      };

      const result = await this.reportService.findAll(filters);
      res.status(200).json({
        success: true,
        data: result.data.data,
        meta: result.meta,
      });
    } catch (error) {
      handleInternalError(error, next);
    }
  };

  completeContentReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const validatedData = CompleteContentReportRequestSchema.parse(req.body);

      const result = await this.reportService.completeReport(id, validatedData);
      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      handleInternalError(error, next);
    }
  };
}
