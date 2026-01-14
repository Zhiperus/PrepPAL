import { PipelineStage } from 'mongoose';

import ContentReportModel from '../models/contentReport.model.js';
import UserModel from '../models/user.model.js';

export interface CitizenMetrics {
  totalCitizens: number;
  avgScore: number;
  activeThisWeek: number;
  preparedCount: number;
  inProgressCount: number;
  atRiskCount: number;
}

export interface ReportMetrics {
  total: number;
  pending: number;
}

export default class LguRepository {
  // We use this to get the "Official Name" of the LGU (e.g. "Barangay Batasan Hills Office")
  async delete(id: string) {
    return UserModel.findByIdAndDelete(id);
  }

  async findById(id: string) {
    return UserModel.findById(id);
  }

  async getLguAdminProfile(barangayCode: string) {
    return UserModel.findOne({
      role: 'lgu',
      'location.barangayCode': barangayCode,
    })
      .select('householdName location email') // householdName = LGU Name
      .lean();
  }

  // 2. REPORT METRICS
  async getReportMetrics(barangayCode: string): Promise<ReportMetrics> {
    const stats = await ContentReportModel.aggregate([
      { $match: { barangayCode: barangayCode } },
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

  // 3. CITIZEN METRICS
  async getCitizenMetrics(barangayCode: string): Promise<CitizenMetrics> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          'location.barangayCode': barangayCode,
          role: 'citizen',
        },
      },
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
}
