import {
  GetLeaderboardQuery,
  OnboardingRequest,
  UpdateProfileInfoRequest,
} from '@repo/shared/dist/schemas/user.schema';

import { NotFoundError } from '../errors/index.js';
import UserRepository from '../repositories/user.repository.js';
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../utils/cloudinary.utils.js';

export default class UserService {
  private userRepo = new UserRepository();

  async completeOnboarding(userId: string, data: OnboardingRequest) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepo.updateOnboardingDetails(userId, {
      location: data.location,
      householdInfo: data.householdInfo,
      phoneNumber: data.phoneNumber,
      householdName: data.householdName,
    });

    return updatedUser;
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Delete from Cloudinary if a profile picture exists
    if (user.profileImageId) {
      await deleteFromCloudinary(user.profileImageId);
    }

    const { url, publicId } = await uploadToCloudinary(file, userId, 'profile');

    const updatedUser = await this.userRepo.updateAvatar(userId, url, publicId);

    return updatedUser;
  }

  async updateProfileInfo(userId: string, data: UpdateProfileInfoRequest) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Explicitly construct the update object
    const updatePayload: Record<string, unknown> = {};

    // if (data.email) updatePayload.email = data.email;
    // if (data.phoneNumber) updatePayload.phoneNumber = data.phoneNumber;
    if (data.householdName) updatePayload.householdName = data.householdName;

    // To update nested fields without overwriting others, use dot notation:
    if (data.notification) {
      if (data.notification.email !== undefined)
        updatePayload['notification.email'] = data.notification.email;
      if (data.notification.sms !== undefined)
        updatePayload['notification.sms'] = data.notification.sms;
    }

    if (data.householdInfo) {
      const householdInfo = data.householdInfo as Record<string, unknown>;
      Object.keys(householdInfo).forEach((key) => {
        updatePayload[`householdInfo.${key}`] = householdInfo[key] as unknown;
      });
    }

    const updatedUser = await this.userRepo.updateProfileInfo(
      userId,
      updatePayload,
    );

    return updatedUser;
  }

  async getLeaderboard(params: GetLeaderboardQuery & { userId: string }) {
    const currentUser = await this.userRepo.findById(params.userId);

    const filterRegion = params.region || currentUser?.location?.region;
    const filterProvince = params.province || currentUser?.location?.province;
    const filterCity = params.city || currentUser?.location?.city;
    const filterBarangay = params.barangay || currentUser?.location?.barangay;

    const users = await this.userRepo.getLeaderboard({
      ...params,
      region: filterRegion,
      province: filterProvince,
      city: filterCity,
      barangay: filterBarangay,
    });
    return users;
  }

  async getTopLeaderboard(limit: number = 50) {
    const result = await this.userRepo.getTopLeaderboard(limit);

    // Format the response with rank numbers
    if (result.length > 0 && result[0].data) {
      type AggUser = {
        id: string;
        householdName?: string;
        location?: {
          city?: string;
          province?: string;
          region?: string;
          barangay?: string;
        };
        points?: { goBag?: number; community?: number; modules?: number };
        totalPoints?: number;
        profileImage?: string | null;
      };

      const leaderboardData = result[0].data.map(
        (user: AggUser, index: number) => ({
          ...user,
          rank: index + 1,
        }),
      );

      return {
        totalUsers: result[0].metadata[0]?.total || 0,
        users: leaderboardData,
      };
    }

    return {
      totalUsers: 0,
      users: [],
    };
  }

  async getUserStats(userId: string) {
    const stats = await this.userRepo.getUserStats(userId);
    return stats;
  }

  async getUserCompletedQuizzes(userId: string, minScore: number = 70) {
    const quizzes = await this.userRepo.getUserCompletedQuizzes(
      userId,
      minScore,
    );
    return quizzes;
  }
}
