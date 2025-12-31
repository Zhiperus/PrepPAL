import { NotFoundError } from '../errors/index.js';
import GoBagRepository from '../repositories/goBag.repository.js';
import PostRepository from '../repositories/post.repository.js';

export default class GoBagService {
  private goBagRepo = new GoBagRepository();
  private postRepo = new PostRepository();

  async getHydratedGoBag({ userId }: { userId: string }) {
    const [catalogItems, userBag, latestPost] = await Promise.all([
      this.goBagRepo.findAllCatalogItems(),
      this.goBagRepo.findBagByUserId(userId),
      this.postRepo.findLatestByUserId(userId),
    ]);

    const currentBag = userBag || (await this.goBagRepo.createBag(userId));

    const packedSet = new Set(currentBag.items.map((id) => id.toString()));

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
      imageUrl: latestPost?.imageUrl || null,
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
}
