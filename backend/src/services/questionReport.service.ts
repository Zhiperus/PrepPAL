import {
  CompleteQuestionReportRequest,
  GetQuestionReportsQuery,
} from '@repo/shared/dist/schemas/questionReport.schema';

import { NotFoundError } from '../errors/index.js';
import QuestionReportRepository from '../repositories/questionReport.repository.js';

export default class QuestionReportService {
  private questionReportRepo = new QuestionReportRepository();

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
