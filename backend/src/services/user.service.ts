import { OnboardingRequest } from '@shared/schemas/user.schema';

import { NotFoundError } from '../errors';
import UserRepository from '../repositories/user.repository';

export default class UserService {
  private userRepo = new UserRepository();

  async getUserById(userId: string) {
    const user = await this.AuthRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user.toJSON();
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
    });

    return updatedUser;
  }
}
