import { NotFoundError } from '../errors';
import UserRepository from '../repositories/user.repository';

export default class UserService {
  private userRepo = new UserRepository();

  async getUserById(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user.toJSON();
  }
}
