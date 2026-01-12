import type { User } from '@repo/shared/dist/schemas/user.schema';
import mongoose, { Document, Schema } from 'mongoose';

// 1. BASE INTERFACE (Common fields for everyone)
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

// 2. BASE SCHEMA OPTIONS
const baseOptions = {
  discriminatorKey: 'role', // This magically handles the type switching
  collection: 'users',
  timestamps: true,
};

// 3. BASE SCHEMA (Shared Fields Only)
const BaseUserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    // Shared Profile Data
    householdName: { type: String, default: null }, // Admin Name or Family Name
    profileImage: { type: String, default: null },
    profileImageId: { type: String, default: null },

    // Both need to know which LGU they belong to/manage
    lguId: { type: Schema.Types.ObjectId, ref: 'Lgu', default: null },

    // Auth & System Flags
    onboardingCompleted: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['citizen', 'lgu', 'super_admin'],
      default: 'citizen',
    },

    // Shared Notification Settings
    notification: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },

    // Auth Tokens
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  baseOptions,
);

// --- Global Indexes & Transformations (Apply to Base) ---

// Indexes are collection-level, so we define them here even if fields are on sub-schemas
// Using sparse: true helps if these fields don't exist on LGU users
BaseUserSchema.index({ 'points.goBag': -1 }, { sparse: true });
BaseUserSchema.index({ 'points.modules': -1 }, { sparse: true });
BaseUserSchema.index({ 'points.community': -1 }, { sparse: true });

BaseUserSchema.set('toJSON', {
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

// 4. CREATE BASE MODEL
const UserModel = mongoose.model<IUser>('User', BaseUserSchema);

// ==========================================
// CITIZEN DISCRIMINATOR (The Complex One)
// ==========================================

const CitizenSchema = new Schema({
  phoneNumber: { type: String, default: null },
  location: {
    region: String,
    province: String,
    city: String,
    barangay: String,
  },
  // Defaults strictly for Citizens
  householdInfo: {
    memberCount: { type: Number, default: 0 },
    femaleCount: { type: Number, default: 0 },
    pets: { type: Number, default: 0 },
  },
  points: {
    goBag: { type: Number, default: 0 },
    community: { type: Number, default: 0 },
    modules: { type: Number, default: 0 },
  },
  completedModules: {
    type: [
      {
        moduleId: { type: Schema.Types.ObjectId, ref: 'Module' },
        bestScore: { type: Number, default: 0 },
        pointsAwarded: { type: Number, default: 0 },
      },
    ],
    default: [], // Citizens get an empty array by default
  },
});

// ==========================================
// LGU DISCRIMINATOR (The Clean One)
// ==========================================

const LguSchema = new Schema({});

const SuperAdminSchema = new Schema({});

// 5. EXPORT MODELS
export const CitizenModel = UserModel.discriminator('citizen', CitizenSchema);
export const LguUserModel = UserModel.discriminator('lgu', LguSchema);
export const SuperAdminModel = UserModel.discriminator(
  'super_admin',
  SuperAdminSchema,
);
// Default export remains UserModel for general queries (login, findById)
export default UserModel;
