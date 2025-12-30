import { deleteFromCloudinary, uploadToCloudinary } from '@repo/shared';
import {
  GetLeaderboardQuery,
  OnboardingRequest,
  UpdateProfileInfoRequest,
} from '@repo/shared/dist/schemas/user.schema';

import { NotFoundError } from '../errors/index.js';
import UserRepository from '../repositories/user.repository.js';

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
    const updatePayload: any = {};

    if (data.email) updatePayload.email = data.email;
    if (data.phoneNumber) updatePayload.phoneNumber = data.phoneNumber;
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
}
