import { ConflictError, NotFoundError } from '../errors';
import { IUser } from '../models/user.model';
import AuthRepository from '../repositories/auth.repository';

export default class AuthService {
  private AuthRepo = new AuthRepository();

  async signup(userData?: Partial<IUser>) {
    if (!userData) {
      throw new Error('User data is required');
    }

    const { email, password } = userData;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const existingUser = await this.AuthRepo.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await this.AuthRepo.hashPassword(password);

    const newUser = await this.AuthRepo.createUser({
      email,
      password: hashedPassword,
    });

    return newUser;
  }

  //TODO: async login();

  //TODO: async logout();
}
