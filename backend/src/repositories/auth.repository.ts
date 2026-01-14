import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import UserModel, { IUser } from '../models/user.model.js';

interface TokenPayload {
  userId: string;
  role: 'citizen' | 'lgu' | 'super_admin';
  cityCode?: string;
  barangayCode?: string;
}
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT-SECRET';
const BCRYPT_SALT_ROUNDS: number = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 10;

export default class AuthRepository {
  async updateLastActive(userId: string) {
    return UserModel.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
  }
  // Find user by Id
  async findById(userId: string) {
    return UserModel.findById(userId);
  }

  // Find user by email
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  // compare password
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Create a new user
  async createUser(data: {
    email: string;
    password: string;
    role: string;
  }): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }

  // Generate JWT
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }

  async saveResetToken(
    userId: string,
    token: string,
    expires: Date,
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
      { new: true },
    );
  }

  async updatePasswordAndClearToken(
    userId: string,
    newPasswordHash: string,
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(userId, {
      password: newPasswordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async saveVerificationToken(
    userId: string,
    token: string,
    expires: Date,
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        verificationToken: token,
        verificationTokenExpires: expires,
      },
      { new: true },
    );
  }

  async findByVerificationToken(hashedToken: string): Promise<IUser | null> {
    return UserModel.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });
  }

  async markEmailAsVerified(userId: string): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
      { new: true },
    );
  }
}
