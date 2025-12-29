import Post, { IPost } from '../models/post.model.js';
import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import mongoose from 'mongoose';


// Options for sorting posts
export interface GetPostsOptions {
    sortBy?: 'createdAt' | 'verificationCount' | 'verifiedItemCount';
    order?: 'asc' | 'desc';
}

// Data required to create a new post
export interface CreatePostData {
    userId: string;
    imageUrl: string;
    imageId: string;
}

export default class PostRepository {
    /**
     * Retrieves all posts with optional sorting.
     * Populates user info and sorts by specified field (default: createdAt desc).
     */
    async findAll(options: GetPostsOptions = {}) {
        const { sortBy = 'createdAt', order = 'desc' } = options;
        const sortOrder = order === 'asc' ? 1 : -1;

        return Post.find()
            .sort({ [sortBy]: sortOrder })
            .populate('userId', 'email householdName profileImage')
            .lean();
    }

    /**
     * Finds a single post by its ID.
     */
    async findById(postId: string) {
        return Post.findById(postId);
    }

    /**
     * Creates a new post with a snapshot of the user's current GoBag items.
     * If user has no GoBag, creates post with empty bagSnapshot.
     */
    async create(data: CreatePostData) {
        const { userId, imageUrl, imageId } = data;

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

            // Map each item to a snapshot object
            bagSnapshot = items.map((item) => ({
                itemId: String(item._id),
                name: item.name,
                category: item.category,
            }));
        }

        // Create and save the new post
        const post = new Post({
            userId: new mongoose.Types.ObjectId(userId),
            imageUrl,
            imageId,
            bagSnapshot,
            verifiedItemCount: 0,
            verificationCount: 0,
        });

        return post.save();
    }

    /**
     * Updates the verification statistics for a post.
     * Called after ratings are added/updated to recalculate averages.
     */
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
