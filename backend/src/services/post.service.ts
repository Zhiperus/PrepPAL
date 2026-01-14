import { GetPostsQuery } from '@repo/shared/dist/schemas/post.schema';

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../errors/index.js';
import GoBagRepository from '../repositories/goBag.repository.js';
import PostRepository from '../repositories/post.repository.js';
import RatingRepository from '../repositories/rating.repository.js';
import UserRepository from '../repositories/user.repository.js';

import UserService from './user.service.js';

export interface CreatePostInput {
  userId: string;
  caption: string;
}

export default class PostService {
  private postRepo = new PostRepository();
  private ratingRepo = new RatingRepository();
  private userRepo = new UserRepository();
  private userService = new UserService();
  private goBagRepo = new GoBagRepository();

  /**
   * Gets all posts with optional sorting options.
   */

  async getAllPosts(options: GetPostsQuery) {
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
   * Creates a new post using a snapshot of the user's go bag.
   * Uses the imageUrl and imageId from the user's go bag.
   */
  async createPost(data: CreatePostInput) {
    const { userId, caption } = data;

    // 1. Get the user's go bag with image
    const goBag = await this.goBagRepo.findBagByUserId(userId);
    if (!goBag) throw new NotFoundError('Go Bag not found');

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (!goBag.imageUrl || !goBag.imageId || goBag.imageUrl === 'pending') {
      throw new BadRequestError(
        'No go bag image found. Please upload a go bag image first.',
      );
    }

    if (!user?.location?.barangayCode) {
      throw new BadRequestError('User is not assigned to a Barangay yet');
    }

    // 2. Create the post with the snapshot of the go bag image
    const newPost = await this.postRepo.create({
      userId,
      caption,
      imageUrl: goBag.imageUrl,
      imageId: goBag.imageId,
      barangayCode: user.location.barangayCode,
    });

    await this.userService.recalculateAndSaveGoBagScore(
      userId,
      newPost._id.toString(),
    );

    return newPost;
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
    const MIN_RATERS_TO_VERIFY = 3;

    const post = await this.postRepo.findPostById(postId);
    if (!post) throw new NotFoundError('Post not found');

    // Prevent Author from rating their own post
    if (post.userId.toString() === raterUserId) {
      throw new ForbiddenError('You cannot verify your own post.');
    }

    // Prevent Double Voting (Idempotency)
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

    // We fetch ALL ratings to see if we have enough people (Quorum)
    const allRatings = await this.ratingRepo.findByPostId(postId);
    const totalRaters = allRatings.length;
    const majorityThreshold = totalRaters / 2;

    let newVerifiedItemCount = 0;

    // ONLY calculate verification if we have enough raters (Quorum Met)
    if (totalRaters >= MIN_RATERS_TO_VERIFY) {
      // Iterate through the items the AUTHOR claimed to have
      post.bagSnapshot.forEach((item) => {
        // Count how many neighbors said "Yes, I see this item"
        const votesForItem = allRatings.filter((r) =>
          r.verifiedItemIds.includes(item.itemId.toString()),
        ).length;

        // If > 50% of raters verified it, it counts as Verified
        if (votesForItem > majorityThreshold) {
          newVerifiedItemCount++;
        }
      });
    }

    await this.postRepo.updatePostStats(
      postId,
      newVerifiedItemCount,
      totalRaters,
    );

    // 5. REWARDS & SCORING

    // A. Reward the RATER (The Neighbor)
    // They get +1 COMMUNITY Point for helping out.
    // (Ensure you have this method in UserRepo, or use updatePoints('community', 1))
    await this.userRepo.updateUserCommunityPoints(raterUserId, 1);

    // B. Update the AUTHOR (The Post Owner)
    // Their GoBag Readiness Score might change because of this new verification.
    if (totalRaters >= MIN_RATERS_TO_VERIFY) {
      await this.userService.recalculateAndSaveGoBagScore(
        post.userId.toString(),
        postId,
      );
    }

    // 6. Return Result
    return {
      success: true,
      verifiedCount: newVerifiedItemCount,
      totalRaters,
      isPendingConsensus: totalRaters < MIN_RATERS_TO_VERIFY,
      message:
        totalRaters < MIN_RATERS_TO_VERIFY
          ? `Rating submitted! Need ${MIN_RATERS_TO_VERIFY - totalRaters} more reviews to verify.`
          : 'Rating submitted and verified count updated.',
    };
  }
  async deletePost(postId: string) {
    const post = await this.postRepo.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    await this.postRepo.findByIdAndDelete(postId);
  }
}
