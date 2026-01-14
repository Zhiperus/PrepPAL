import {
  CompleteContentReportRequest,
  GetContentReportsQuery,
} from '@repo/shared/dist/schemas/contentReport.schema';

import ContentReportModel, {
  IContentReport,
} from '../models/contentReport.model.js';

export default class ContentReportRepository {
  async create(data: Partial<IContentReport>) {
    return ContentReportModel.create(data);
  }

  async findExistingReport(reporterId: string, postId: string) {
    return ContentReportModel.findOne({ reporterId, postId });
  }

  async findByIdAndUpdate(id: string, data: CompleteContentReportRequest) {
    return ContentReportModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findAll(filters: GetContentReportsQuery) {
    // Ensure numbers for pagination math
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 10);
    const { sortBy, order, barangayCode, status } = filters;

    const pipeline: any[] = [];

    // 1. Filter by Status
    if (status && status !== 'ALL') {
      pipeline.push({ $match: { status } });
    }

    // 2. Filter by Barangay Code
    // We do this BEFORE the lookup for better performance
    // (since we added barangayCode to the Report Schema)
    if (barangayCode) {
      pipeline.push({
        $match: { barangayCode: barangayCode },
      });
    }

    // 3. Join with Posts (To show context)
    pipeline.push({
      $lookup: {
        from: 'posts',
        localField: 'postId',
        foreignField: '_id',
        as: 'postDetails',
      },
    });

    pipeline.push({ $unwind: '$postDetails' });

    // 4. Facet for Data + Count
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
      {
        path: 'reporterId',
        select: 'householdName email profileImage barangayCode',
      },
      {
        path: 'postId',
        populate: {
          path: 'userId', // The author of the post
          select: 'householdName email profileImage barangayCode',
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
    const { barangayCode, status } = filters;

    // Build the query object
    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (barangayCode) {
      query.barangayCode = barangayCode;
    }

    // Since we now have barangayCode on the model itself,
    // we don't need an expensive aggregate lookup just to count.
    return ContentReportModel.countDocuments(query);
  }
}
