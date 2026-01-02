import type { Module } from '@repo/shared/dist/schemas/module.schema'; // Adjust path if needed
import mongoose, { Document, Schema } from 'mongoose';

export interface IModule
  extends Omit<Module, 'content' | 'createdAt'>,
    Document {
  content: {
    imageUrl?: string | null;
    text: string;
    reference?: string;
    referenceUrl?: string | null;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema(
  {
    imageUrl: { type: String, default: null },
    text: { type: String, required: true },
    reference: { type: String },
    referenceUrl: { type: String, default: null },
  },
  { _id: false },
);

const moduleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    logo: { type: String, required: true },
    content: [contentSchema],
  },
  { timestamps: true },
);

const ModuleModel = mongoose.model<IModule>('Module', moduleSchema);
export default ModuleModel;
