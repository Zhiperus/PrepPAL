import * as crypto from 'crypto';

import { ConflictError, NotFoundError } from '../errors';
import { getResetPasswordTemplate } from '../lib/email-templates';
import { resend } from '../lib/mail';
import { IUser } from '../models/user.model';
import AuthRepository from '../repositories/auth.repository';

export default class AuthService {
  private AuthRepo = new AuthRepository();

  async getUserById(userId: string) {
    const user = await this.AuthRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user.toJSON();
  }

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

    const token = this.AuthRepo.generateToken({ userId: String(newUser._id) });

    return {
      user: { id: newUser._id, email: newUser.email },
      token,
    };
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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: 'PrepPAL <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Password',
      html: getResetPasswordTemplate(resetLink),
    });

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
