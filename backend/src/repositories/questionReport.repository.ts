import {
  CompleteQuestionReportRequest,
  GetQuestionReportsQuery,
} from '@repo/shared/dist/schemas/questionReport.schema';
import mongoose from 'mongoose';

import QuestionReportModel, {
  IQuestionReport,
} from '../models/questionReport.model.js';

export default class QuestionReportRepository {
  async create(data: Partial<IQuestionReport>) {
    return QuestionReportModel.create(data);
  }

  async findExisting(reporterId: string, questionId: string) {
    return QuestionReportModel.findOne({ reporterId, questionId });
  }

  async findByIdAndUpdate(id: string, data: CompleteQuestionReportRequest) {
    return QuestionReportModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findAll(filters: GetQuestionReportsQuery) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 10);
    const { sortBy, order, status } = filters;

    const pipeline: any[] = [];

    // 1. Filter by Status
    if (status && status !== 'ALL') {
      pipeline.push({ $match: { status } });
    }

    // 2. Join with Quizzes and extract the reported question
    pipeline.push({
      $lookup: {
        from: 'quizzes',
        let: { qId: '$quizId', targetQuestionId: '$questionId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$qId'] } } },
          {
            $project: {
              moduleId: 1,
              reportedQuestion: {
                $filter: {
                  input: '$questions',
                  as: 'q',
                  cond: { $eq: ['$$q._id', '$$targetQuestionId'] },
                },
              },
            },
          },
          {
            $unwind: {
              path: '$reportedQuestion',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: 'quizContext',
      },
    });

    pipeline.push({
      $unwind: { path: '$quizContext', preserveNullAndEmptyArrays: true },
    });

    // 3. Facet for Data + Count
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

    const [result] = await QuestionReportModel.aggregate(pipeline);
    const data = result.data;
    const total = result.totalCount[0]?.count || 0;

    // 4. Populate User details
    if (data.length > 0) {
      await QuestionReportModel.populate(data, [
        { path: 'reporterId', select: 'householdName email profileImage' },
      ]);
    }

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async count(filters: GetQuestionReportsQuery) {
    const { status } = filters;
    const query: any = {
      status: status && status !== 'ALL' ? status : { $exists: true },
    };
    return QuestionReportModel.countDocuments(query);
  }
}
