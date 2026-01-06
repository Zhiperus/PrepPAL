import { FilterQuery } from 'mongoose';

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

        // Build the search query
        const query: FilterQuery<any> = {};

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' }; // Case-insensitive
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
            ];
        }

        // Execute query and count in parallel
        const [modules, total] = await Promise.all([
            Module.find(query)
                .select('-content')
                .sort({ createdAt: -1 }) // Most recent first
                .skip(skip)
                .limit(limit)
                .lean(),
            Module.countDocuments(query),
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
