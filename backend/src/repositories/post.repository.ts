import Post, { IPost } from '../models/post.model.js';
import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import mongoose from 'mongoose';

export interface GetPostsOptions {
    sortBy?: 'createdAt' | 'verificationCount' | 'verifiedItemCount';
    order?: 'asc' | 'desc';
}

export interface CreatePostData {
    userId: string;
    imageUrl: string;
    caption?: string;
}

export default class PostRepository {
    async findAll(options: GetPostsOptions = {}) {
        const { sortBy = 'createdAt', order = 'desc' } = options;
        const sortOrder = order === 'asc' ? 1 : -1;

        return Post.find()
            .sort({ [sortBy]: sortOrder })
            .populate('userId', 'username profilePicture');
    }

    async findById(postId: string) {
        return Post.findById(postId);
    }

    async create(data: CreatePostData) {
        const { userId, imageUrl, caption } = data;

        // Get the user's current GoBag
        const goBag = await GoBagModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
        });

        // Create bagSnapshot - empty array if user has no GoBag yet
        let bagSnapshot: { itemId: string; name: string; category: string }[] = [];

        if (goBag && goBag.items.length > 0) {
            // Get the items from the GoBag and create a deep copy (snapshot)
            const items = await GoBagItemModel.find({
                _id: { $in: goBag.items },
            });

            bagSnapshot = items.map((item) => ({
                itemId: String(item._id),
                name: item.name,
                category: item.category,
            }));
        }

        const post = new Post({
            userId: new mongoose.Types.ObjectId(userId),
            imageUrl,
            bagSnapshot,
            verifiedItemCount: 0,
            verificationCount: 0,
        });

        return post.save();
    }

    async updateVerificationStats(
        postId: string,
        verifiedItemCount: number,
        verificationCount: number,
    ) {
        return Post.findByIdAndUpdate(
            postId,
            {
                $set: {
                    verifiedItemCount,
                    verificationCount,
                },
            },
            { new: true },
        );
    }
}
