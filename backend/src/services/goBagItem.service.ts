import { GoBagItem } from '@repo/shared/dist/schemas/goBagItem.schema';

import { NotFoundError } from '../errors/index.js';
import { GO_BAG_ITEMS } from '../lib/seedData.js';
import GoBagItemRepository from '../repositories/goBagItem.repository.js';

export default class GoBagItemService {
  private goBagItemRepo = new GoBagItemRepository();

  async initializeDefaultItems() {
    const count = await this.goBagItemRepo.countAll();
    if (count == 0) {
      await this.goBagItemRepo.seedData(GO_BAG_ITEMS);
    }
  }

  async forceInitializeDefaultItems() {
    await this.goBagItemRepo.deleteAll();
    await this.goBagItemRepo.seedData(GO_BAG_ITEMS);
  }

  async findAll() {
    return this.goBagItemRepo.findAll();
  }

  async findById(id: string) {
    const item = await this.goBagItemRepo.findById(id);
    if (!item) {
      throw new NotFoundError('GoBagItem not found');
    }
    return item;
  }
}
