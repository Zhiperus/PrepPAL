import { uploadToCloudinary } from '@repo/shared';

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../errors/index.js';
import PostRepository, {
  GetPostsOptions,
} from '../repositories/post.repository.js';

export interface CreatePostInput {
  userId: string;
  file: Express.Multer.File;
}

export default class PostService {
  private postRepo = new PostRepository();
  private readonly POINTS_PER_ITEM = 10;

  /**
   * Gets all posts with optional sorting options.
   */
  async getAllPosts(options: GetPostsOptions = {}) {
    return this.postRepo.findAll(options);
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
    const { userId, file } = data;

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

    // 2. Create the post in DB (Repo handles GoBag snapshotting)
    return this.postRepo.create({
      userId,
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
    // 1. Fetch Post
    const post = await this.postRepo.findPostById(postId);
    if (!post) throw new NotFoundError('Post not found');

    // 2. Check Ownership
    if (post.userId.toString() === raterUserId) {
      throw new ForbiddenError('You cannot verify your own post.');
    }

    // 3. Check Duplicate Vote
    const hasRated = await this.postRepo.hasUserRated(postId, raterUserId);
    if (hasRated) {
      throw new BadRequestError('You have already rated this post.');
    }

    // 4. Save Rating
    await this.postRepo.createRating({
      postId,
      raterUserId,
      verifiedItemIds,
    });

    // 5. Recalculate Majority
    const allRatings = await this.postRepo.getPostRatings(postId);
    const totalRaters = allRatings.length;
    const majorityThreshold = totalRaters / 2;

    let newVerifiedItemCount = 0;

    post.bagSnapshot.forEach((item) => {
      const votesForItem = allRatings.filter((r) =>
        r.verifiedItemIds.includes(item.itemId),
      ).length;

      if (votesForItem > majorityThreshold) {
        newVerifiedItemCount++;
      }
    });

    // 6. Calculate Points Delta
    const oldVerifiedItemCount = post.verifiedItemCount;
    const itemsGained = newVerifiedItemCount - oldVerifiedItemCount;
    const pointsAwarded = itemsGained * this.POINTS_PER_ITEM;

    // 7. Update Post Stats
    await this.postRepo.updatePostStats(
      postId,
      newVerifiedItemCount,
      totalRaters,
    );

    // 8. Award Points
    if (pointsAwarded !== 0) {
      await this.postRepo.updateUserGoBagPoints(
        post.userId.toString(),
        pointsAwarded,
      );
    }

    return {
      verifiedCount: newVerifiedItemCount,
      pointsUpdate: pointsAwarded,
    };
  }
}
