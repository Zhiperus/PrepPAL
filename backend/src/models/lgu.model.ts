import type { Lgu } from '@repo/shared/dist/schemas/lgu.schema';
import mongoose, { Schema, Document } from 'mongoose';

export interface ILgu extends Omit<Lgu, 'id'>, Document {
  name: string;
  region: string;
  province: string;
  city: string;
  createdAt: Date;
}

const lguSchema = new Schema<ILgu>(
  {
    name: { type: String, required: true },
    region: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true },
);

const LguModel = mongoose.model<ILgu>('Lgu', lguSchema);

export default LguModel;
