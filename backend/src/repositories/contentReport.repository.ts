import {
  CompleteContentReportRequest,
  GetContentReportsQuery,
} from '@repo/shared/dist/schemas/contentReport.schema';
import mongoose from 'mongoose';

import ContentReportModel from '../models/contentReport.model.js';

export default class ContentReportRepository {
  async findByIdAndUpdate(id: string, data: CompleteContentReportRequest) {
    return ContentReportModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findAll(filters: GetContentReportsQuery) {
    // Ensure numbers for pagination math
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 10);
    const { sortBy, order, lguId, status } = filters;

    const pipeline: any[] = [];

    // 1. Filter by Status
    if (status && status !== 'ALL') {
      pipeline.push({ $match: { status } });
    }

    // 2. Join with Posts
    pipeline.push({
      $lookup: {
        from: 'posts',
        localField: 'postId',
        foreignField: '_id',
        as: 'postDetails',
      },
    });

    pipeline.push({ $unwind: '$postDetails' });

    // 3. Filter by lguId (Logic preserved as requested)
    if (lguId) {
      pipeline.push({
        $match: { 'postDetails.lguId': new mongoose.Types.ObjectId(lguId) },
      });
    }

    // 4. ADDED: Facet for Data + Count
    // This runs two parallel pipelines: one for pagination, one for counting total
    pipeline.push({
      $facet: {
        data: [
          { $sort: { [sortBy || 'createdAt']: order === 'desc' ? -1 : 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    // Execute
    const [result] = await ContentReportModel.aggregate(pipeline);

    // Extract results
    const data = result.data;
    const total = result.totalCount[0]?.count || 0;

    // 5. Populate the data array
    await ContentReportModel.populate(data, [
      { path: 'reporterId', select: 'householdName email profileImage lguId' },
      {
        path: 'postId',
        populate: {
          path: 'userId', // Assuming the Post model refers to the author as 'userId' or 'authorId'
          select: 'householdName email profileImage lguId',
        },
      },
    ]);

    // 6. Return Structured Response
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async count(filters: GetContentReportsQuery) {
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
