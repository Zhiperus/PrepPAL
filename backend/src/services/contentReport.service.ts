import {
  CompleteContentReportRequest,
  GetContentReportsQuery,
} from '@repo/shared/dist/schemas/contentReport.schema';

import { NotFoundError } from '../errors/index.js';
import ContentReportRepository from '../repositories/contentReport.repository.js';

import PostService from './post.service.js';

export default class ContentReportService {
  private reportRepo = new ContentReportRepository();
  private postService = new PostService();

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
    // If RESOLVED, tell the PostService to take action
    if (data.status === 'RESOLVED') {
      try {
        await this.postService.deletePost(report.postId.toString());
      } catch (error) {
        console.error(`Failed to delete post ${report.postId}:`, error);
      }
    }

    return report;
  }
}
