import { CreateLguRequest } from '@repo/shared/dist/schemas/lgu.schema';
import { PipelineStage, Types } from 'mongoose';

import ContentReportModel from '../models/contentReport.model.js';
import LguModel from '../models/lgu.model.js';
import UserModel from '../models/user.model.js';

export interface CitizenMetrics {
  totalCitizens: number;
  avgScore: number;
  activeThisWeek: number;
  // We can keep these for internal calculation but won't send all to frontend if not needed
  preparedCount: number;
  inProgressCount: number;
  atRiskCount: number;
}

export interface ReportMetrics {
  total: number;
  pending: number;
}

export default class LguRepository {
  async getLguDetails(lguId: string) {
    return LguModel.findById(lguId).select('name city province').lean();
  }

  async getLguCompleteInfo(lguId: string) {
    return LguModel.findById(lguId).lean();
  }

  async getReportMetrics(lguId: string): Promise<ReportMetrics> {
    const lguObjectId = new Types.ObjectId(lguId);

    const stats = await ContentReportModel.aggregate([
      { $match: { lguId: lguObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        },
      },
    ]);

    return stats[0] || { total: 0, pending: 0 };
  }

  async getCitizenMetrics(lguId: string): Promise<CitizenMetrics> {
    const lguObjectId = new Types.ObjectId(lguId);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pipeline: PipelineStage[] = [
      { $match: { lguId: lguObjectId, role: 'citizen' } },
      {
        $addFields: {
          calculatedScore: {
            $add: [
              { $ifNull: ['$points.goBag', 0] },
              { $ifNull: ['$points.modules', 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCitizens: { $sum: 1 },
          avgScore: { $avg: '$calculatedScore' },
          preparedCount: {
            $sum: { $cond: [{ $gte: ['$calculatedScore', 80] }, 1, 0] },
          },
          inProgressCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$calculatedScore', 50] },
                    { $lt: ['$calculatedScore', 80] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          atRiskCount: {
            $sum: { $cond: [{ $lt: ['$calculatedScore', 50] }, 1, 0] },
          },
          activeThisWeek: {
            $sum: { $cond: [{ $gte: ['$lastActiveAt', oneWeekAgo] }, 1, 0] },
          },
        },
      },
    ];

    const result = await UserModel.aggregate<CitizenMetrics>(pipeline);

    return (
      result[0] || {
        totalCitizens: 0,
        avgScore: 0,
        preparedCount: 0,
        inProgressCount: 0,
        atRiskCount: 0,
        activeThisWeek: 0,
      }
    );
  }

  async findByName(query: any) {
    return LguModel.findOne(query);
  }

  async createLgu(data: CreateLguRequest) {
    return LguModel.create(data);
  }

  async updateLguData(lguId: string, data: any) {
    return LguModel.findByIdAndUpdate(lguId, data, { new: true });
  }
}
