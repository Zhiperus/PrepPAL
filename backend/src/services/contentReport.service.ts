import {
  CompleteContentReportRequest,
  CreateContentReportRequest,
  GetContentReportsQuery,
} from '@repo/shared/dist/schemas/contentReport.schema';

import { BadRequestError, NotFoundError } from '../errors/index.js';
import ContentReportModel, {
  IContentReport,
} from '../models/contentReport.model.js';
import ContentReportRepository from '../repositories/contentReport.repository.js';
import PostRepository from '../repositories/post.repository.js';
import UserRepository from '../repositories/user.repository.js';

export default class ContentReportService {
  private reportRepo = new ContentReportRepository();
  private postRepo = new PostRepository();
  private userRepo = new UserRepository();

  async create(data: CreateContentReportRequest & { reporterId: string }) {
    const existingReport = await this.reportRepo.findExistingReport(
      data.reporterId,
      data.postId,
    );

    if (existingReport) {
      throw new BadRequestError('You have already reported this post.');
    }

    const post = await this.postRepo.findById(data.postId);
    if (!post) throw new NotFoundError('Post not found');

    const author = await this.userRepo.findById(post.userId.toString());
    if (!author || !author.location?.barangayCode) {
      throw new BadRequestError(
        'Cannot report post: Author location undefined',
      );
    }

    return this.reportRepo.create({
      postId: data.postId as any,
      reporterId: data.reporterId as any,
      reason: data.reason,
      barangayCode: author.location.barangayCode,
      status: 'PENDING',
    });
  }
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
