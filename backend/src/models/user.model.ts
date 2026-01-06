import type { User } from '@repo/shared/dist/schemas/user.schema';
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Omit<User, 'id'>, Document {
  password?: string;

  isEmailVerified: boolean;
  verificationToken: string;
  verificationTokenExpires: Date;
  resetPasswordToken: string;
  resetPasswordExpires: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    householdName: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    location: {
      region: String,
      province: String,
      city: String,
      barangay: String,
    },
    householdInfo: {
      memberCount: { type: Number, default: 0 },
      femaleCount: { type: Number, default: 0 },
      pets: { type: Number, default: 0 },
    },
    role: {
      type: String,
      enum: ['citizen', 'lgu', 'super_admin'],
      default: 'citizen',
    },
    lguId: { type: Schema.Types.ObjectId, ref: 'Lgu', default: null },
    onboardingCompleted: { type: Boolean, default: false },
    notification: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    points: {
      goBag: { type: Number, default: 0 },
      community: { type: Number, default: 0 },
      modules: { type: Number, default: 0 },
    },
    profileImage: { type: String, default: null },
    profileImageId: { type: String, default: null },
    completedModules: [
      {
        moduleId: { type: Schema.Types.ObjectId, ref: 'Module' },
        bestScore: { type: Number, default: 0 },
        pointsAwarded: { type: Number, default: 0 },
      },
    ],
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
  },
);

// -1 = Descending
// This optimizes sorting by these specific point categories
userSchema.index({ 'points.goBag': -1 });
userSchema.index({ 'points.modules': -1 });
userSchema.index({ 'points.community': -1 });
userSchema.set('toJSON', {
  transform: (_: any, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();

    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
    delete returnedObject.verificationToken;
    delete returnedObject.verificationTokenExpires;
    delete returnedObject.resetPasswordToken;
    delete returnedObject.resetPasswordExpires;
  },
});

const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;
