import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../errors/index.js';
import GoBagRepository from '../repositories/goBag.repository.js';
import PostRepository, {
  GetPostsOptions,
} from '../repositories/post.repository.js';
import RatingRepository from '../repositories/rating.repository.js';
import UserRepository from '../repositories/user.repository.js';

export interface CreatePostInput {
  userId: string;
  caption: string;
}

export default class PostService {
  private postRepo = new PostRepository();
  private ratingRepo = new RatingRepository();
  private userRepo = new UserRepository();
  private goBagRepo = new GoBagRepository();

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

    if (!user.lguId) {
      throw new BadRequestError('No LGU to monitor the posts yet');
    }

    // 2. Create the post with the snapshot of the go bag image
    return this.postRepo.create({
      userId,
      caption,
      imageUrl: goBag.imageUrl,
      imageId: goBag.imageId,
      lguId: user.lguId,
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
