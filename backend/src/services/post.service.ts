import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../errors/index.js';
import PostRepository, {
  GetPostsOptions,
} from '../repositories/post.repository.js';
import RatingRepository from '../repositories/rating.repository.js';
import UserRepository from '../repositories/user.repository.js';
import { uploadToCloudinary } from '../utils/cloudinary.utils.js';

export interface CreatePostInput {
  userId: string;
  file: Express.Multer.File;
  caption: string;
}

export default class PostService {
  private postRepo = new PostRepository();
  private ratingRepo = new RatingRepository();
  private userRepo = new UserRepository();

  /**
   * Gets all posts with optional sorting options.
   */

  async getAllPosts(options: GetPostsOptions = {}) {
    return this.postRepo.findAllLatestUnique(options);
  }

  async getUserPosts(userId: string, options: any) {
    return this.postRepo.findAllUserPosts(userId, options);
  }

  /**
   * Gets a single post by its ID.
   */
  async getPostById(postId: string) {
    const post = await this.postRepo.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    return post;
  }

  /**
   * Creates a new post.
   * Uploads image to Cloudinary -> Creates DB Entry with GoBag Snapshot.
   */
  async createPost(data: CreatePostInput) {
    const { userId, file, caption } = data;

    // 1. Upload image to Cloudinary
    let url: string;
    let publicId: string;

    try {
      const result = await uploadToCloudinary(file, userId, 'posts');
      url = result.url;
      publicId = result.publicId;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return this.postRepo.create({
      userId,
      caption,
      imageUrl: url,
      imageId: publicId,
    });
  }

  /**
   * Handles the community verification logic.
   * Calculates majority votes and awards points.
   */
  async verifyPostItems({
    raterUserId,
    postId,
    verifiedItemIds,
  }: {
    raterUserId: string;
    postId: string;
    verifiedItemIds: string[];
  }) {
    const post = await this.postRepo.findPostById(postId);
    if (!post) throw new NotFoundError('Post not found');

    if (post.userId.toString() === raterUserId) {
      throw new ForbiddenError('You cannot verify your own post.');
    }

    const existingRating = await this.ratingRepo.findByPostAndUser(
      postId,
      raterUserId,
    );
    if (existingRating) {
      throw new BadRequestError('You have already rated this post.');
    }

    await this.ratingRepo.create({
      postId,
      raterUserId,
      verifiedItemIds,
    });

    // We need ALL ratings to calculate consensus
    const allRatings = await this.ratingRepo.findByPostId(postId);

    const totalRaters = allRatings.length;
    const majorityThreshold = totalRaters / 2;

    let newVerifiedItemCount = 0;

    // Check every item in the snapshot against the "Votes" ledger
    post.bagSnapshot.forEach((item) => {
      // Count how many rating documents contain this specific Item ID
      const votesForItem = allRatings.filter((r) =>
        r.verifiedItemIds.includes(item.itemId.toString()),
      ).length;

      if (votesForItem > majorityThreshold) {
        newVerifiedItemCount++;
      }
    });

    await this.postRepo.updatePostStats(
      postId,
      newVerifiedItemCount,
      totalRaters,
    );

    //Add 1 to the rater's community points
    await this.userRepo.updateUserGoBagPoints(post.userId.toString(), 1);

    return {
      verifiedCount: newVerifiedItemCount,
    };
  }
}
