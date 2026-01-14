import { NotFoundError } from '../errors/index.js';
import GoBagRepository from '../repositories/goBag.repository.js';
import GoBagItemRepository from '../repositories/goBagItem.repository.js';
import PostRepository from '../repositories/post.repository.js';
import UserRepository from '../repositories/user.repository.js';
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../utils/cloudinary.utils.js';

export default class GoBagService {
  private goBagRepo = new GoBagRepository();
  private postRepo = new PostRepository();
  private goBagItemRepo = new GoBagItemRepository();
  private userRepo = new UserRepository();

  async getHydratedGoBag({ userId }: { userId: string }) {
    const [catalogItems, userBag] = await Promise.all([
      this.goBagRepo.findAllCatalogItems(),
      this.goBagRepo.findBagByUserId(userId),
    ]);

    if (!userBag)
      throw new NotFoundError('Failed to retrieve or create Go Bag');

    const currentBag = userBag;

    const packedSet = new Set(
      currentBag.items.map((id: string) => id.toString()),
    );

    const hydratedItems = catalogItems.map((item) => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      defaultQuantity: item.defaultQuantity,
      isPacked: packedSet.has(item._id.toString()),
    }));

    const totalItems = catalogItems.length;
    const packedCount = currentBag.items.length;
    const progress =
      totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

    return {
      completeness: progress,
      items: hydratedItems,
      imageUrl:
        currentBag.imageUrl === 'pending' ? null : currentBag.imageUrl || null,
    };
  }

  /**
   * Unified Update: Handles Image Upload/Cleanup AND Item Updates
   */
  async updateGoBag({
    userId,
    file,
    items,
  }: {
    userId: string;
    file: any;
    items: any[];
  }) {
    // 1. Get the current go bag details (to check for an existing image to delete)
    const currentImage = await this.goBagRepo.getGoBagImage(userId);

    let url: string = currentImage?.imageUrl || 'pending';
    let publicId: string = currentImage?.imageId || '';

    // 2. If a new file is provided, upload it and clean up the old one
    if (file) {
      try {
        const result = await uploadToCloudinary(file, userId, 'posts');
        url = result.url;
        publicId = result.publicId;

        // Cleanup: If there was a previous image, check if we should delete it
        if (currentImage?.imageId) {
          // Check if this image was ever posted to the social feed
          const wasPosted = await this.postRepo.findByImageId(
            currentImage.imageId,
          );

          // If it wasn't used in a post, safe to delete from Cloudinary
          if (!wasPosted) {
            try {
              await deleteFromCloudinary(currentImage.imageId);
            } catch (delError) {
              console.error(
                'Failed to delete old image from Cloudinary:',
                delError,
              );
              // Proceed without throwing; failing to delete old image shouldn't block update
            }
          }
        }
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new Error(
          `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // 3. Extract Item IDs if items are objects, or use as is if strings
    // Assumes items array contains objects with _id or are just id strings
    const itemIds = items.map((item) => (item._id ? item._id : item));

    // 4. Update Database via Repository
    const updatedBag = await this.goBagRepo.updateFullGoBag(
      userId,
      itemIds,
      url,
      publicId,
    );

    // 1. Get the denominator (Total Items defined by system)
    const totalPossibleItems = await this.goBagItemRepo.countAll();

    // 2. Get the numerator (Items user just checked)
    const userItemCount = itemIds.length;

    let newScore = 0;

    if (totalPossibleItems > 0) {
      // Calculate ratio (0.0 to 1.0)
      const ratio = userItemCount / totalPossibleItems;

      // Scale to max 60 points
      newScore = Math.round(ratio * 60);
    }

    // 3. Update User Profile
    // note: this "resets" the score. if they had verification points (the other 40%),
    // changing their bag contents logically invalidates that verification anyway.
    await this.userRepo.updateGoBagScore(userId, newScore);

    return updatedBag;
  }
}
