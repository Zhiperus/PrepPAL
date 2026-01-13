import AdminRepository from '../repositories/admin.repository.js';

export interface DashboardStats {
  totalFlaggedPosts: number;
  newUsersToday: number;
  totalUsers: number;
  totalReports: number;
  resolvedReports: number;
  dismissedReports: number;
}

export default class AdminService {
  private adminRepository = new AdminRepository();

  /**
   * Get aggregated dashboard statistics for admin panel
   * @returns DashboardStats object with all relevant counts
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Execute all queries in parallel for better performance
    const [
      totalFlaggedPosts,
      newUsersToday,
      totalUsers,
      totalReports,
      resolvedReports,
      dismissedReports,
    ] = await Promise.all([
      this.adminRepository.getTotalFlaggedPosts(),
      this.adminRepository.getNewUsersToday(),
      this.adminRepository.getTotalUsers(),
      this.adminRepository.getTotalReports(),
      this.adminRepository.getResolvedReports(),
      this.adminRepository.getDismissedReports(),
    ]);

    return {
      totalFlaggedPosts,
      newUsersToday,
      totalUsers,
      totalReports,
      resolvedReports,
      dismissedReports,
    };
  }
}
