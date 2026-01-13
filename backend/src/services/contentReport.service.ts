import {
  CompleteContentReportRequest,
  GetContentReportsQuery,
} from '@repo/shared/dist/schemas/contentReport.schema';

import { NotFoundError } from '../errors/index.js';
import ContentReportRepository from '../repositories/contentReport.repository.js';
import PostRepository from '../repositories/post.repository.js';

export default class ContentReportService {
  private reportRepo = new ContentReportRepository();
  private postRepo = new PostRepository();

  async findAll(filters: GetContentReportsQuery) {
    const [data, total] = await Promise.all([
      this.reportRepo.findAll(filters),
      this.reportRepo.count(filters),
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

  async completeReport(id: string, data: CompleteContentReportRequest) {
    const report = await this.reportRepo.findByIdAndUpdate(id, data);

    if (!report) throw new NotFoundError('Report not found');
    // If RESOLVED, delete the post
    if (data.status === 'RESOLVED') {
      try {
        await this.postRepo.findByIdAndDelete(report.postId.toString());
      } catch (error) {
        console.error(`Failed to delete post ${report.postId}:`, error);
      }
    }

    return report;
  }
}
