import GoBagModel, { IGoBag } from '../models/goBag.model.js';
import GoBagItemModel, { IGoBagItem } from '../models/goBagItem.model.js';

export default class GoBagRepository {
  async findAllCatalogItems(): Promise<IGoBagItem[]> {
    return GoBagItemModel.find({}).lean() as unknown as IGoBagItem[];
  }

  // --- User Bag Operations ---

  // Renamed to findOrCreate for clarity, though keeping findBagByUserId signature is fine
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
      { upsert: true },
    );
  }

  // Atomic Remove
  async removeItemFromBag(userId: string, itemId: string): Promise<void> {
    await GoBagModel.updateOne({ userId }, { $pull: { items: itemId } });
  }

  // Get go bag image details only
  async getGoBagImage(
    userId: string,
  ): Promise<{ imageUrl: string; imageId: string | null } | null> {
    const goBag = await GoBagModel.findOne({ userId }).select(
      'imageUrl imageId',
    );
    if (!goBag) return null;
    return {
      imageUrl: goBag.imageUrl || '',
      imageId: goBag.imageId || null,
    };
  }

  /**
   * Unified Update: Updates both the Items list and the Image details
   */
  async updateFullGoBag(
    userId: string,
    items: string[],
    imageUrl: string,
    imageId: string,
  ): Promise<IGoBag | null> {
    return GoBagModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          items: items,
          imageUrl: imageUrl,
          imageId: imageId, // Store the publicId for future deletion
          lastUpdated: new Date(),
        },
      },
      { new: true, upsert: true },
    );
  }
}
