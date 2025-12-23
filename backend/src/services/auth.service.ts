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

  async login(credentials: { email: string; password: string }) {
    const { email, password } = credentials;

    const user = await this.AuthRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Invalid email or password');
    }

    if (!user.password) {
      throw new NotFoundError('Invalid email or password');
    }

    const isPasswordValid = await this.AuthRepo.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundError('Invalid email or password');
    }

    const token = this.AuthRepo.generateToken({ userId: String(user._id) });

    return {
      user: { id: user._id, email: user.email },
      token,
    };
  }

  //TODO: async logout();
}
