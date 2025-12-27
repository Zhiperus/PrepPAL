import Post from '../models/post.model.js';

export type SortField = 'date' | 'averageScore';
export type SortOrder = 'asc' | 'desc';

export interface GetPostsOptions {
    sortBy?: SortField;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}

export default class PostRepository {
    async findAll(options: GetPostsOptions = {}) {
        const {
            sortBy = 'date',
            sortOrder = 'desc',
            page = 1,
            limit = 10,
        } = options;

        const skip = (page - 1) * limit;
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        const [posts, total] = await Promise.all([
            Post.find()
                .populate('userId', 'name email profilePicture')
                .populate('goBagId')
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(limit)
                .lean(),
            Post.countDocuments(),
        ]);

        return {
            posts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
