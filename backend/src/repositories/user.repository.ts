import User from '../models/user.model';

export default class UserRepository {
  async findById(userId: string) {
    return User.findById(userId);
  }
}
