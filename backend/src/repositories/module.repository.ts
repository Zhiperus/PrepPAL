import { FilterQuery, PipelineStage } from 'mongoose';

import Module from '../models/module.model.js';

export type GetModulesOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

export default class ModuleRepository {
  /**
   * Retrieves all modules with pagination and optional search.
   * Search applies to both title and description fields.
   */
  async findAll(options: GetModulesOptions = {}) {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    // 1. Build the Match Stage (Filter)
    const matchStage: FilterQuery<any> = {};
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      matchStage.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // 2. Build the Pipeline
    const pipeline: PipelineStage[] = [
      { $match: matchStage },

      {
        $addFields: {
          readingTime: {
            $multiply: [{ $size: { $ifNull: ['$content', []] } }, 2],
          },
        },
      },

      // CLEANUP STAGE: Explicitly exclude the heavy 'content' array
      { $project: { content: 0 } },

      // PAGINATION STAGES
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // 3. Execute Parallel: Aggregation for data, countDocuments for total
    const [modules, total] = await Promise.all([
      Module.aggregate(pipeline),
      Module.countDocuments(matchStage),
    ]);

    return { modules, total };
  }
  /**
   * Finds a single module by its ID.
   */
  async findById(moduleId: string) {
    return Module.findById(moduleId).lean();
  }

  /**
   * Search modules by query string (searches title and description).
   * This is an alias for findAll with search parameter for clarity.
   */
  async search(query: string, options: GetModulesOptions = {}) {
    return this.findAll({ ...options, search: query });
  }
}
