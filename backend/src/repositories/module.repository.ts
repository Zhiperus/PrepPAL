import { FilterQuery, PipelineStage } from 'mongoose';

import Module, { IModule } from '../models/module.model.js';
import UserModel from '../models/user.model.js';

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
  async findAll(userId: string, options: GetModulesOptions = {}) {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    // 1. Fetch the User's Progress
    const user = await UserModel.findById(userId)
      .select('completedModules')
      .lean();

    const progressMap = new Map(
      user?.completedModules.map((m) => [m.moduleId.toString(), m]),
    );

    // 2. Standard Module Aggregation
    const matchStage: FilterQuery<any> = {};
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $addFields: {
          readingTime: {
            $multiply: [{ $size: { $ifNull: ['$content', []] } }, 2],
          },
          totalQuestions: { $size: { $ifNull: ['$quiz', []] } },
        },
      },
      { $project: { content: 0 } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [rawModules, total] = await Promise.all([
      Module.aggregate(pipeline),
      Module.countDocuments(matchStage),
    ]);

    // 3. MERGE: Attach user score
    const modules = rawModules.map((module) => {
      const userProgress = progressMap.get(module._id.toString());
      return {
        ...module,
        userScore: userProgress ? userProgress.bestScore : null,
        isCompleted: !!userProgress,
      };
    });

    return { modules, total };
  }

  /**
   * Finds a single module by its ID.
   */
  async findById(moduleId: string) {
    return Module.findById(moduleId).lean();
  }

  /**
   * Search modules by query string.
   * FIX: Added userId parameter to match findAll signature.
   */
  async search(userId: string, query: string, options: GetModulesOptions = {}) {
    return this.findAll(userId, { ...options, search: query });
  }

  async countAll(): Promise<number> {
    return Module.countDocuments();
  }

  async create(data: Partial<IModule>) {
    return Module.create(data);
  }

  async update(id: string, data: Partial<IModule>) {
    return Module.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string) {
    return Module.findByIdAndDelete(id);
  }
}
