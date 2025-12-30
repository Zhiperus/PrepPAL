import PostModel, { IPost } from '../models/post.model.js';
import RatingModel, { IRating } from '../models/rating.model.js';
import UserModel from '../models/user.model.js';

export default class PostRepository {
  // Find a post by ID
  async findPostById(postId: string): Promise<IPost | null> {
    return PostModel.findById(postId);
  }

  // Check if a user has already rated a specific post
  async hasUserRated(postId: string, raterUserId: string): Promise<boolean> {
    const existingRating = await RatingModel.exists({ postId, raterUserId });
    return !!existingRating;
  }

  // Create a new rating document
  async createRating(data: {
    postId: string;
    raterUserId: string;
    verifiedItemIds: string[];
  }): Promise<IRating> {
    return RatingModel.create(data);
  }

  // Fetch all ratings for a post (to calculate majority)
  async getPostRatings(postId: string): Promise<IRating[]> {
    return RatingModel.find({ postId }).select('verifiedItemIds');
  }

  // Update the Post's verification statistics
  async updatePostStats(
    postId: string,
    verifiedItemCount: number,
    verificationCount: number,
  ): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(
      postId,
      {
        verifiedItemCount,
        verificationCount,
      },
      { new: true },
    );
  }

  // Update a User's GoBag points
  async updateUserGoBagPoints(
    userId: string,
    pointsDelta: number,
  ): Promise<void> {
    if (pointsDelta === 0) return;

    await UserModel.findByIdAndUpdate(userId, {
      $inc: { 'points.goBag': pointsDelta },
    });
  }
}
