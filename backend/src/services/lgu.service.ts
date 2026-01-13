import GoBagRepository from '../repositories/goBag.repository.js';
import GoBagItemRepository from '../repositories/goBagItem.repository.js';
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
  private goBagItemRepo = new GoBagItemRepository();
  private goBagRepo = new GoBagRepository();

  async getDashboardMetrics(
    cityCode: string,
    barangayCode: string,
  ): Promise<DashboardMetricsResponse> {
    // 1. Try to find the LGU Admin to get the "Official Name"
    const lguAdmin = await this.lguRepo.getLguAdminProfile(barangayCode);

    // 2. Run Stats
    const [citizenStats, reportStats] = await Promise.all([
      this.lguRepo.getCitizenMetrics(barangayCode),
      this.lguRepo.getReportMetrics(barangayCode),
    ]);

    // 3. Resolve Display Info
    // If admin exists, use their profile data. If not, use generic placeholders.
    const name = lguAdmin?.householdName || `Barangay ${barangayCode}`;
    const location = lguAdmin?.location
      ? `${lguAdmin.location.city}, ${lguAdmin.location.province}`
      : `City Code ${cityCode}`;

    return {
      lguDetails: { name, location },
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

  async getLguAnalytics(barangayCode: string) {
    const totalPossibleItems = await this.goBagItemRepo.countAll();
    const goBagStats = await this.goBagRepo.getLguStats(
      barangayCode,
      totalPossibleItems,
    );
    const itemBreakdown = await this.goBagRepo.getItemBreakdown(
      barangayCode,
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

  async getResidentGoBags(barangayCode: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const totalPossibleItems = await this.goBagItemRepo.countAll();

    const result = await this.goBagRepo.getResidentGoBags(
      barangayCode,
      skip,
      limit,
      totalPossibleItems,
    );

    return {
      data: result[0].data,
      total: result[0].metadata[0]?.total || 0,
    };
  }
}
