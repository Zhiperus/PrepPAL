import UserRepository from '../repositories/user.repository';

export default class UserService {
  private userRepo = new UserRepository();
}
