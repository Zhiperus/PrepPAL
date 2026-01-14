import {
  CreateLguAccountRequest,
  GetLeaderboardQuery,
  OnboardingRequest,
  UpdateProfileInfoRequest,
} from '@repo/shared/dist/schemas/user.schema';

import { NotFoundError } from '../errors/index.js';
import GoBagItemRepository from '../repositories/goBagItem.repository.js';
import PostRepository from '../repositories/post.repository.js';
import UserRepository from '../repositories/user.repository.js';
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../utils/cloudinary.utils.js';

export default class UserService {
  private userRepo = new UserRepository();
  private postRepo = new PostRepository();
  private goBagItemRepo = new GoBagItemRepository();

  async recalculateAndSaveGoBagScore(userId: string, postId: string) {
    const post = await this.postRepo.findPostById(postId);
    const totalPossibleItems = await this.goBagItemRepo.countAll();

    if (!post || totalPossibleItems === 0) return;

    const userItemCount = post.bagSnapshot.length;
    const completenessRatio = userItemCount / totalPossibleItems;
    const completenessPoints = completenessRatio * 100 * 0.6;

    const verifiedItemCount = post?.verifiedItemCount || 0;
    const verificationRatio = verifiedItemCount / totalPossibleItems;
    const verificationPoints = verificationRatio * 100 * 0.4;

    const finalScore = Math.round(completenessPoints + verificationPoints);

    await this.userRepo.updateGoBagScore(userId, finalScore);

    return finalScore;
  }

  async getUserRank(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const rankData = await this.userRepo.getUserRank(userId);

    // Default to rank 0 or null if something goes wrong, though unlikely if user exists
    return {
      rank: rankData ? rankData.rank : 0,
      totalScore: rankData ? rankData.totalScore : 0,
    };
  }

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
    const updatePayload: any = {};

    if (data.householdName) updatePayload.householdName = data.householdName;

    // To update nested fields without overwriting others, use dot notation:
    if (data.notification) {
      if (data.notification.email !== undefined)
        updatePayload['notification.email'] = data.notification.email;
      if (data.notification.sms !== undefined)
        updatePayload['notification.sms'] = data.notification.sms;
    }

    if (data.householdInfo) {
      Object.keys(data.householdInfo).forEach((key) => {
        updatePayload[`householdInfo.${key}`] = (data.householdInfo as any)[
          key
        ];
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

  async findById(id: string) {
    return this.userRepo.findById(id);
  }

  async findLguAccounts(query: any, page: number = 1, limit: number = 10) {
    return this.userRepo.findLguAccounts(query, page, limit);
  }

  async getCitizenCountByLgu(barangayCode: string) {
    const citizenCount = await this.userRepo.getCitizenCountByLgu(barangayCode);
    return citizenCount;
  }

  async countLguAccounts(query: Record<string, any>) {
    const safeQuery = { ...query, role: 'lgu' };
    return this.userRepo.count(safeQuery);
  }

  async findByEmail(query: any) {
    return this.userRepo.findByEmail(query);
  }

  async createLguAccount(data: CreateLguAccountRequest) {
    return this.userRepo.createLguAccount(data);
  }

  async findLguAdminByCode(barangayCode: string) {
    return this.userRepo.findByEmail({
      // We look for the user who manages this code
      barangayCode: barangayCode,
      role: 'lgu',
    });
  }

  async updateUser(userId: string, data: any) {
    return this.userRepo.updateProfileInfo(userId, data);
  }
}
