import mongoose from 'mongoose';

import Rating, { IRating } from '../models/rating.model.js';

export interface CreateRatingData {
  postId: string;
  raterUserId: string;
  verifiedItemIds: string[];
}

export default class RatingRepository {
  async findByPostAndUser(postId: string, raterUserId: string) {
    return Rating.findOne({
      postId: new mongoose.Types.ObjectId(postId),
      raterUserId: new mongoose.Types.ObjectId(raterUserId),
    });
  }

  async findByPostId(postId: string) {
    return Rating.find({
      postId: new mongoose.Types.ObjectId(postId),
    });
  }

  async create(data: CreateRatingData) {
    const rating = new Rating({
      postId: new mongoose.Types.ObjectId(data.postId),
      raterUserId: new mongoose.Types.ObjectId(data.raterUserId),
      verifiedItemIds: data.verifiedItemIds,
    });

    return rating.save();
  }

  async update(ratingId: string, verifiedItemIds: string[]) {
    return Rating.findByIdAndUpdate(
      ratingId,
      {
        $set: { verifiedItemIds },
      },
      { new: true },
    );
  }

  /**
   * Check if a user has already rated a specific post
   */
  async hasUserRated(postId: string, raterUserId: string): Promise<boolean> {
    const existingRating = await RatingModel.exists({ postId, raterUserId });
    return !!existingRating;
  }

  /**
   * Create a new rating document
   */
  async createRating(data: {
    postId: string;
    raterUserId: string;
    verifiedItemIds: string[];
  }): Promise<IRating> {
    return RatingModel.create(data);
  }

  /**
   * Fetch all ratings for a post (to calculate majority)
   */
  async getPostRatings(postId: string): Promise<IRating[]> {
    return RatingModel.find({ postId }).select('verifiedItemIds');
  }
}
