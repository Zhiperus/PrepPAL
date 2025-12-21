import * as crypto from 'crypto';

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

  async forgotPassword(email: string) {
    const user = await this.AuthRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

    await this.AuthRepo.saveResetToken(
      user.id,
      resetToken,
      passwordResetExpires,
    );

    // 3. Send Email (MOCK implementation)
    // In production, use Nodemailer or SendGrid here.
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    console.log(`\n=== EMAIL SIMULATION ===`);
    console.log(`To: ${email}`);
    console.log(`Subject: Password Reset Request`);
    console.log(`Link: ${resetUrl}`);
    console.log(`========================\n`);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.AuthRepo.findByResetToken(token);

    if (!user) {
      throw new Error('Token is invalid or has expired');
    }

    const hashedPassword = await this.AuthRepo.hashPassword(newPassword);

    await this.AuthRepo.updatePasswordAndClearToken(user.id, hashedPassword);

    return { message: 'Password has been reset successfully' };
  }
}
