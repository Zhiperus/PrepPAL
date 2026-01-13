import type { Post } from '@repo/shared/dist/schemas/post.schema';
import mongoose, { Document, Schema } from 'mongoose';

export interface IPost
  extends Omit<Post, '_id' | 'userId' | 'createdAt'>,
    Document {
  userId: mongoose.Types.ObjectId;
  barangayCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    barangayCode: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageId: { type: String, default: null },
    caption: { type: String, default: null },
    bagSnapshot: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
      },
    ],
    verifiedItemCount: { type: Number, default: 0 },
    verificationCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const PostModel = mongoose.model<IPost>('Post', postSchema);
export default PostModel;
