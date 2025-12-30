import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../errors/index.js';
import PostRepository from '../repositories/post.repository.js';

export default class PostService {
  private postRepo = new PostRepository();
  private readonly POINTS_PER_ITEM = 10;

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

    const hasRated = await this.postRepo.hasUserRated(postId, raterUserId);
    if (hasRated) {
      throw new BadRequestError('You have already rated this post.');
    }

    await this.postRepo.createRating({
      postId,
      raterUserId,
      verifiedItemIds,
    });

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

    const oldVerifiedItemCount = post.verifiedItemCount;
    const itemsGained = newVerifiedItemCount - oldVerifiedItemCount;
    const pointsAwarded = itemsGained * this.POINTS_PER_ITEM;

    await this.postRepo.updatePostStats(
      postId,
      newVerifiedItemCount,
      totalRaters,
    );

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
