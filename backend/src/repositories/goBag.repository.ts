import GoBagModel, { IGoBag } from '../models/goBag.model.js';
import GoBagItemModel, { IGoBagItem } from '../models/goBagItem.model.js';

export default class GoBagRepository {
  async findAllCatalogItems(): Promise<IGoBagItem[]> {
    return GoBagItemModel.find({}).lean() as unknown as IGoBagItem[];
  }

  // --- User Bag Operations ---
  async findBagByUserId(userId: string): Promise<IGoBag | null> {
    return GoBagModel.findOne({ userId });
  }

  async createBag(userId: string): Promise<IGoBag> {
    return GoBagModel.create({ userId, items: [] });
  }

  // Atomic Add (Idempotent)
  async addItemToBag(userId: string, itemId: string): Promise<void> {
    await GoBagModel.updateOne({ userId }, { $addToSet: { items: itemId } });
  }

  // Atomic Remove
  async removeItemFromBag(userId: string, itemId: string): Promise<void> {
    await GoBagModel.updateOne({ userId }, { $pull: { items: itemId } });
  }
}
