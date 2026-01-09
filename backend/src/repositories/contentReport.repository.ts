import {
  CompleteReportRequest,
  GetReportsQuery,
} from '@repo/shared/dist/schemas/contentReport.schema';
import mongoose from 'mongoose';

import ContentReportModel from '../models/contentReport.model.js';

export default class ContentReportRepository {
  async findByIdAndUpdate(id: string, data: CompleteReportRequest) {
    return ContentReportModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findAll(filters: GetReportsQuery) {
    const { page, limit, sortBy, order, lguId, status } = filters;

    const pipeline: any[] = [];

    // 1. Filter by Status (exists on Report)
    if (status && status !== 'ALL') {
      pipeline.push({ $match: { status } });
    }

    // 2. Join with Posts to get lguId
    pipeline.push({
      $lookup: {
        from: 'posts',
        localField: 'postId',
        foreignField: '_id',
        as: 'postDetails',
      },
    });

    // Unwind the array created by lookup
    pipeline.push({ $unwind: '$postDetails' });

    // 3. Filter by lguId
    if (lguId) {
      pipeline.push({
        $match: { 'postDetails.lguId': new mongoose.Types.ObjectId(lguId) },
      });
    }

    // 4. Sort, Skip, Limit
    pipeline.push({ $sort: { [sortBy]: order === 'desc' ? -1 : 1 } });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Execute
    const results = await ContentReportModel.aggregate(pipeline);

    // Note: Manual population is needed after aggregate or use $lookup for everything
    return ContentReportModel.populate(results, [
      { path: 'reporterId', select: 'householdName email profileImage lguId' },
      {
        path: 'postId',
        populate: {
          path: 'userId',
          select: 'householdName email profileImage lguId',
        },
      },
    ]);
  }

  async count(filters: GetReportsQuery) {
    const { lguId, status } = filters;

    // Define the base match logic
    const statusFilter = status && status !== 'ALL' ? { status } : {};

    if (!lguId) {
      return ContentReportModel.countDocuments(statusFilter);
    }

    const countPipeline: any[] = [];

    // Add status match if needed
    if (status && status !== 'ALL') {
      countPipeline.push({ $match: { status } });
    }

    countPipeline.push(
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: '$post' },
      { $match: { 'post.lguId': new mongoose.Types.ObjectId(lguId) } },
      { $count: 'total' },
    );

    const result = await ContentReportModel.aggregate(countPipeline);
    return result[0]?.total || 0;
  }
}
