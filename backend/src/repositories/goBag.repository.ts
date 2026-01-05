import GoBagModel, { IGoBag } from '../models/goBag.model.js';
import GoBagItemModel, { IGoBagItem } from '../models/goBagItem.model.js';

export default class GoBagRepository {
  async findAllCatalogItems(): Promise<IGoBagItem[]> {
    return GoBagItemModel.find({}).lean() as unknown as IGoBagItem[];
  }

  // --- User Bag Operations ---
  async findBagByUserId(userId: string): Promise<IGoBag | null> {
    return GoBagModel.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          items: [],
          imageUrl: 'pending',
          imageId: null,
          lastUpdated: new Date(),
        },
      },
      { upsert: true, new: true },
    );
  }

  // Atomic Add (Idempotent)
  async addItemToBag(userId: string, itemId: string): Promise<void> {
    await GoBagModel.updateOne(
      { userId },
      { $addToSet: { items: itemId } },
      { upsert: true }, // Ensure bag exists when adding items
    );
  }

  // Atomic Remove
  async removeItemFromBag(userId: string, itemId: string): Promise<void> {
    await GoBagModel.updateOne({ userId }, { $pull: { items: itemId } });
  }

  // Update go bag image
  async updateGoBagImage(
    userId: string,
    imageUrl: string,
    imageId: string,
  ): Promise<void> {
    await GoBagModel.updateOne(
      { userId },
      {
        $set: {
          imageUrl: imageUrl,
          imageId: imageId,
          lastUpdated: new Date(),
        },
      },
      { upsert: true },
    );
  }

  // Get go bag image
  async getGoBagImage(
    userId: string,
  ): Promise<{ imageUrl: string; imageId: string | null } | null> {
    const goBag = await GoBagModel.findOne({ userId }).select('imageUrl imageId');
    if (!goBag) return null;
    return {
      imageUrl: goBag.imageUrl || '',
      imageId: goBag.imageId || null,
    };
  }
}
