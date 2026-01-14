import {
  GetQuestionReportsQuerySchema,
  GetQuestionReportsQuery,
  CompleteQuestionReportRequestSchema,
  CreateQuestionReportSchema,
} from '@repo/shared/dist/schemas/questionReport.schema';
import { NextFunction, Request, Response } from 'express';

import QuestionReportService from '../services/questionReport.service.js';

export default class QuestionReportController {
  private questionReportService = new QuestionReportService();

  createQuestionReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = CreateQuestionReportSchema.parse(req.body);
      const reporterId = req.userId;

      const report = await this.questionReportService.create({
        ...data,
        reporterId: reporterId!,
      });

      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };

  findAllQuestionReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const validatedQuery = GetQuestionReportsQuerySchema.parse(req.query);

      const filters: GetQuestionReportsQuery = {
        ...validatedQuery,
      };

      const result = await this.questionReportService.findAll(filters);
      res.status(200).json({
        success: true,
        data: result.data.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  completeQuestionReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const validatedData = CompleteQuestionReportRequestSchema.parse(req.body);

      const result = await this.questionReportService.completeReport(
        id,
        validatedData,
      );
      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  };
}
