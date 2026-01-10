import LguRepository from '../repositories/lgu.repository.js';

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
}
