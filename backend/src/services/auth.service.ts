import * as crypto from 'crypto';

import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/index.js';
import {
  getResetPasswordTemplate,
  getVerifyEmailTemplate,
} from '../lib/email-templates.js';
import { resend } from '../lib/mail.js';
import { IUser } from '../models/user.model.js';
import AuthRepository from '../repositories/auth.repository.js';
import GoBagRepository from '../repositories/goBag.repository.js';

export default class AuthService {
  private AuthRepo = new AuthRepository();
  private GoBagRepo = new GoBagRepository();

  async generateFreshToken(userId: string) {
    const user = await this.AuthRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    return this.AuthRepo.generateToken({
      userId: String(user._id),
      role: user.role,
      cityCode: user?.location?.cityCode,
      barangayCode: user?.location?.barangayCode,
    });
  }

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
      role: userData.role || 'citizen',
    });

    await this.GoBagRepo.findBagByUserId(String(newUser._id));

    await this.AuthRepo.updateLastActive(String(newUser._id));

    const token = this.AuthRepo.generateToken({
      userId: String(newUser._id),
      role: newUser.role,
    });

    this.sendVerificationEmail(String(newUser._id));

    return {
      user: newUser,
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

    await this.AuthRepo.updateLastActive(String(user._id));

    const token = this.AuthRepo.generateToken({
      userId: String(user._id),
      role: user.role,
      cityCode: user.location?.cityCode,
      barangayCode: user.location?.barangayCode,
    });

    return {
      user: user,
      token,
    };
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.AuthRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.isEmailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.AuthRepo.saveVerificationToken(
      String(user._id),
      hashedToken,
      tokenExpires,
    );

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/auth/verify-email?token=${token}`;

    await resend.emails.send({
      from: 'PrepPAL <onboarding@resend.dev>',
      to: user.email,
      subject: 'Verify your PrepPAL Email',
      html: getVerifyEmailTemplate(verifyLink),
    });
  }

  async verifyEmailToken(rawToken: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const user = await this.AuthRepo.findByVerificationToken(hashedToken);

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    await this.AuthRepo.markEmailAsVerified(String(user._id));

    return user;
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

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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
