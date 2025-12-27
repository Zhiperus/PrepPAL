import type { Rating } from '@repo/shared/dist/schemas/rating.schema';
import mongoose, { Document, Schema } from 'mongoose';

export interface IRating
  extends Omit<Rating, '_id' | 'postId' | 'raterUserId'>,
    Document {
  postId: mongoose.Types.ObjectId;
  raterUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    raterUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    verifiedItemIds: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  },
);

ratingSchema.index({ postId: 1, raterUserId: 1 }, { unique: true });

const RatingModel = mongoose.model<IRating>('Rating', ratingSchema);
export default RatingModel;
