import { CreateLguRequest } from '@repo/shared/dist/schemas/lgu.schema';
import { Types } from 'mongoose';

import GoBagRepository from '../repositories/goBag.repository.js';
import GoBagItemRepository from '../repositories/goBagItem.repository.js';
import LguRepository from '../repositories/lgu.repository.js';
import UserRepository from '../repositories/user.repository.js';

export interface DashboardMetricsResponse {
  lguDetails: {
    name: string;
    location: string;
  };
  overall: {
    averageScore: number;
    totalCitizens: number;
  };
  reports: {
    total: number;
    pending: number;
  };
  engagement: {
    activeThisWeek: number;
  };
}

export default class LguService {
  private lguRepo = new LguRepository();
  private userRepo = new UserRepository();
  private goBagItemRepo = new GoBagItemRepository();
  private goBagRepo = new GoBagRepository();

  async getDashboardMetrics(lguId: string): Promise<DashboardMetricsResponse> {
    const lguDetails = await this.lguRepo.getLguDetails(lguId);
    if (!lguDetails) throw new Error('LGU not found');

    const [citizenStats, reportStats] = await Promise.all([
      this.lguRepo.getCitizenMetrics(lguId),
      this.lguRepo.getReportMetrics(lguId),
    ]);

    return {
      lguDetails: {
        name: lguDetails.name,
        location: `${lguDetails.city}, ${lguDetails.province}`,
      },
      overall: {
        averageScore: Math.round(citizenStats.avgScore || 0),
        totalCitizens: citizenStats.totalCitizens,
      },
      reports: {
        total: reportStats.total,
        pending: reportStats.pending,
      },
      engagement: {
        activeThisWeek: citizenStats.activeThisWeek,
      },
    };
  }

  async getLguAnalytics(lguId: string) {
    const objectIdLgu = new Types.ObjectId(lguId);
    const totalPossibleItems = await this.goBagItemRepo.countAll();

    const goBagStats = await this.goBagRepo.getLguStats(
      objectIdLgu,
      totalPossibleItems,
    );
    const itemBreakdown = await this.goBagRepo.getItemBreakdown(
      objectIdLgu,
      goBagStats.length,
    );

    let fullyPrepared = 0;
    let partiallyPrepared = 0;
    let atRisk = 0;

    goBagStats.forEach((bag) => {
      if (bag.score >= 80) fullyPrepared++;
      else if (bag.score >= 40) partiallyPrepared++;
      else atRisk++;
    });

    return {
      itemBreakdown,
      distribution: {
        fullyPrepared,
        partiallyPrepared,
        atRisk,
        total: goBagStats.length,
      },
    };
  }

  async getResidentGoBags(lguId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const totalPossibleItems = await this.goBagItemRepo.countAll();

    const result = await this.goBagRepo.getResidentGoBags(
      lguId,
      skip,
      limit,
      totalPossibleItems,
    );

    return {
      data: result[0].data,
      total: result[0].metadata[0]?.total || 0,
    };
  }

  async getLguCompleteInfo(lguId: string) {
    return this.lguRepo.getLguCompleteInfo(lguId);
  }

  async findByName(query: any) {
    return this.lguRepo.findByName(query);
  }

  async createLgu(data: CreateLguRequest) {
    return this.lguRepo.createLgu(data);
  }

  async updateLguData(lguId: string, data: any) {
    return this.lguRepo.updateLguData(lguId, data);
  }
}
