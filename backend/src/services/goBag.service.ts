import { NotFoundError } from '../errors/index.js';
import GoBagRepository from '../repositories/goBag.repository.js';
import PostRepository from '../repositories/post.repository.js';
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../utils/cloudinary.utils.js';

export default class GoBagService {
  private goBagRepo = new GoBagRepository();
  private postRepo = new PostRepository();

  async getHydratedGoBag({ userId }: { userId: string }) {
    const [catalogItems, userBag] = await Promise.all([
      this.goBagRepo.findAllCatalogItems(),
      this.goBagRepo.findBagByUserId(userId),
    ]);

    if (!userBag) throw new NotFoundError('Failed to retrieve or create Go Bag');

    const currentBag = userBag;

    const packedSet = new Set(currentBag.items.map((id: string) => id.toString()));

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

  async toggleItem({ userId, itemId }: { userId: string; itemId: string }) {
    const userBag = await this.goBagRepo.findBagByUserId(userId);

    if (!userBag) throw new NotFoundError('Go Bag not initialized');

    const isPacked = userBag.items.some((id) => id.toString() === itemId);

    if (isPacked) {
      await this.goBagRepo.removeItemFromBag(userId, itemId);
    } else {
      await this.goBagRepo.addItemToBag(userId, itemId);
    }

    return {
      itemId,
      isPacked: !isPacked,
    };
  }

  async updateGoBagImage({
    userId,
    file,
  }: {
    userId: string;
    file: Express.Multer.File;
  }) {
    // 1. Get the current go bag image
    const currentImage = await this.goBagRepo.getGoBagImage(userId);

    // 2. Upload new image to Cloudinary
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

    // 3. Check if the previous go bag image was posted to the community
    // If it wasn't posted, delete it from Cloudinary
    if (currentImage?.imageId) {
      const wasPosted = await this.postRepo.findByImageId(
        currentImage.imageId,
      );

      if (!wasPosted) {
        try {
          await deleteFromCloudinary(currentImage.imageId);
        } catch (error) {
          console.error('Failed to delete old image from Cloudinary:', error);
          // Continue even if deletion fails
        }
      }
    }

    // 4. Update the go bag image in the database
    await this.goBagRepo.updateGoBagImage(userId, url, publicId);

    return {
      imageUrl: url,
      imageId: publicId,
    };
  }
}
