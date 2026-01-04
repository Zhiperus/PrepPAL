import mongoose, { Document } from 'mongoose';

// TypeScript interface for Content
export interface IContent {
  type: 'text' | 'video' | 'image' | 'quiz' | 'link';
  title: string;
  data: unknown; // Mixed type - can be string, object, array, etc. depending on content type
  order: number;
}

// TypeScript interface for Module
export interface IModule extends Document {
  title: string;
  description: string;
  logo: string;
  content: IContent[];
  createdAt: Date;
  updatedAt: Date;
}

// ContentSchema for module content items
const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'video', 'image', 'quiz', 'link'],
      required: true,
    },
    title: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    order: { type: Number, required: true },
  },
  { _id: false },
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String, required: true },
    content: [contentSchema],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

const Module = mongoose.model<IModule>('Module', moduleSchema);

export default Module;
