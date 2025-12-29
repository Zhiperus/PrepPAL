import UserModel, { IUser } from '../models/user.model.js';

export default class UserRepository {
  async findById(userId: string) {
    return UserModel.findById(userId);
  }

  async updateOnboardingDetails(userId: string, data: Partial<IUser>) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...data,
          onboardingCompleted: true,
        },
      },
      { new: true },
    );
  }

  async updateAvatar(
    userId: string,
    profileImage: string,
    profileImageId: string,
  ) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          profileImage: profileImage,
          profileImageId: profileImageId,
        },
      },
      { new: true },
    );
  }
}
