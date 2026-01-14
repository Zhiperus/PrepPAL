import {
  CompleteQuestionReportRequest,
  CreateQuestionReportRequest,
  GetQuestionReportsQuery,
} from '@repo/shared/dist/schemas/questionReport.schema';
import { Types } from 'mongoose';

import { BadRequestError, NotFoundError } from '../errors/index.js';
import QuestionReportRepository from '../repositories/questionReport.repository.js';

export default class QuestionReportService {
  private questionReportRepo = new QuestionReportRepository();

  async create(data: CreateQuestionReportRequest & { reporterId: string }) {
    const existing = await this.questionReportRepo.findExisting(
      data.reporterId,
      data.questionId,
    );

    if (existing) {
      throw new BadRequestError('You have already reported this question.');
    }

    return this.questionReportRepo.create({
      quizId: new Types.ObjectId(data.quizId) as any,
      questionId: new Types.ObjectId(data.questionId) as any,
      reporterId: new Types.ObjectId(data.reporterId) as any,
      reason: data.reason,
      status: 'PENDING',
    });
  }

  async findAll(filters: GetQuestionReportsQuery) {
    const [data, total] = await Promise.all([
      this.questionReportRepo.findAll(filters),
      this.questionReportRepo.count(filters),
    ]);

    return {
      data,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async completeReport(id: string, data: CompleteQuestionReportRequest) {
    const report = await this.questionReportRepo.findByIdAndUpdate(id, data);

    if (!report) throw new NotFoundError('Report not found');

    return report;
  }
}
