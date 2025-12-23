import { User } from '@repo/shared/dist/schemas/user.schema';
import mongoose, { Document } from 'mongoose';

export interface IUser extends Omit<User, '_id'>, Document {
  password?: string;
  isEmailVerified: boolean;
  verificationToken: string;
  verificationTokenExpires: Date;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    householdName: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    location: {
      region: String,
      province: String,
      city: String,
      barangay: String,
    },
    householdInfo: {
      memberCount: Number,
      femaleCount: Number,
      dogCount: Number,
      catCount: Number,
    },
    role: {
      type: String,
      enum: ['citizen', 'lgu'],
      default: 'citizen',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    notification: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    points: {
      goBag: { type: Number, default: 0 },
      modules: { type: Number, default: 0 },
      community: { type: Number, default: 0 },
    },
    goBags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserGoBag' }],
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: {
      type: String,
      select: false,
    },

    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  },
);

// This ensures that when we convert a Mongoose document to JSON (e.g., in an API response),
// the password hash is not included by default.
userSchema.set('toJSON', {
  transform: (_: any, returnedObject: any) => {
    delete returnedObject.password;
    delete returnedObject.__v;
    delete returnedObject.verificationToken;
    delete returnedObject.verificationTokenExpires;
    delete returnedObject.resetPasswordToken;
    delete returnedObject.resetPasswordExpires;
  },
});

const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;
