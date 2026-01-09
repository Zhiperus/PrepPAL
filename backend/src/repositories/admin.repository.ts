import ContentReportModel from '../models/contentReport.model.js';
import UserModel from '../models/user.model.js';

export default class AdminRepository {
    /**
     * Get the total count of flagged posts (content reports with PENDING status)
     */
    async getTotalFlaggedPosts(): Promise<number> {
        return ContentReportModel.countDocuments({ status: 'PENDING' });
    }

    /**
     * Get the count of new users registered today
     */
    async getNewUsersToday(): Promise<number> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return UserModel.countDocuments({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        });
    }

    /**
     * Get the total count of all users
     */
    async getTotalUsers(): Promise<number> {
        return UserModel.countDocuments();
    }

    /**
     * Get the total count of all content reports
     */
    async getTotalReports(): Promise<number> {
        return ContentReportModel.countDocuments();
    }

    /**
     * Get the count of resolved content reports
     */
    async getResolvedReports(): Promise<number> {
        return ContentReportModel.countDocuments({ status: 'RESOLVED' });
    }

    /**
     * Get the count of dismissed content reports
     */
    async getDismissedReports(): Promise<number> {
        return ContentReportModel.countDocuments({ status: 'DISMISSED' });
    }
}
