import { OnboardingRequest } from '@repo/shared/dist/schemas/user.schema';

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
    });

    return updatedUser;
  }
}
