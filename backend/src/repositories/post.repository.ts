import mongoose from 'mongoose';

import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import PostModel, { IPost } from '../models/post.model.js';
import RatingModel, { IRating } from '../models/rating.model.js';
import UserModel from '../models/user.model.js';

// Options for sorting posts
export interface GetPostsOptions {
  sortBy?: 'createdAt' | 'verificationCount' | 'verifiedItemCount';
  order?: 'asc' | 'desc';
}

// Data required to create a new post
export interface CreatePostData {
  userId: string;
  imageUrl: string;
  imageId: string;
}

export default class PostRepository {
  /**
   * Retrieves all posts with optional sorting.
   * Populates user info and sorts by specified field (default: createdAt desc).
   */
  async findAll(options: GetPostsOptions = {}) {
    const { sortBy = 'createdAt', order = 'desc' } = options;
    const sortOrder = order === 'asc' ? 1 : -1;

    return PostModel.find()
      .sort({ [sortBy]: sortOrder })
      .populate('userId', 'email householdName profileImage')
      .lean();
  }

  async findLatestByUserId(userId: string): Promise<IPost | null> {
    return PostModel.findOne({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Finds a single post by its ID.
   */
  async findById(postId: string): Promise<IPost | null> {
    return PostModel.findById(postId);
  }

  /**
   * Alias for findById to maintain compatibility with existing service calls
   */
  async findPostById(postId: string): Promise<IPost | null> {
    return this.findById(postId);
  }

  /**
   * Creates a new post with a snapshot of the user's current GoBag items.
   * If user has no GoBag, creates post with empty bagSnapshot.
   */
  async create(data: CreatePostData) {
    const { userId, imageUrl, imageId } = data;

    // 1. Get the user's current GoBag
    const goBag = await GoBagModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // 2. Create bagSnapshot - empty array if user has no GoBag yet
    let bagSnapshot: { itemId: string; name: string; category: string }[] = [];

    if (goBag && goBag.items.length > 0) {
      // 3. Get the items from the GoBag and create a deep copy (snapshot)
      const items = await GoBagItemModel.find({
        _id: { $in: goBag.items },
      });

      // 4. Map each item to a snapshot object
      bagSnapshot = items.map((item) => ({
        itemId: String(item._id),
        name: item.name,
        category: item.category,
      }));
    }

    // 5. Create and save the new post
    const post = new PostModel({
      userId: new mongoose.Types.ObjectId(userId),
      imageUrl,
      imageId,
      bagSnapshot,
      verifiedItemCount: 0,
      verificationCount: 0,
    });

    return post.save();
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

  /**
   * Updates the verification statistics for a post.
   * Called after ratings are added/updated to recalculate averages.
   */
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

  /**
   * Update a User's GoBag points
   */
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
