import UserModel, { IUser } from '../models/user.model';

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
}
