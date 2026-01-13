import { GoBagItem } from '@repo/shared/dist/schemas/goBagItem.schema';

import GoBagItemModel from '../models/goBagItem.model.js';

export default class GoBagItemRepository {
  async countAll() {
    return GoBagItemModel.countDocuments();
  }

  async seedData(data: Omit<GoBagItem, '_id'>[]) {
    return GoBagItemModel.insertMany(data);
  }

  async deleteAll() {
    await GoBagItemModel.deleteMany({});
  }

  async findById(id: string) {
    return GoBagItemModel.findById(id);
  }

  async findAll() {
    return GoBagItemModel.find();
  }

  async getTotalItems() {
    return GoBagItemModel.countDocuments();
  }
}
