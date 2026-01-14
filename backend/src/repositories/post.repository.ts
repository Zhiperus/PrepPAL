import {
  CreatePostRequest,
  GetPostsQuery,
} from '@repo/shared/dist/schemas/post.schema';
import mongoose, { FilterQuery } from 'mongoose';

import GoBagModel from '../models/goBag.model.js';
import GoBagItemModel from '../models/goBagItem.model.js';
import PostModel, { IPost } from '../models/post.model.js';
import UserModel from '../models/user.model.js';

export default class PostRepository {
  /**
   * Retrieves all posts with optional sorting.
   * Populates user info and sorts by specified field (default: createdAt desc).
   */
  async findAll(options: GetPostsQuery) {
    const {
      sortBy = 'createdAt',
      order = 'desc',
      search,
      page = 1,
      limit = 10,
      cityCode,
      barangayCode,
    } = options;

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    // 1. Build the Search Query
    const query: FilterQuery<any> = {};

    if (barangayCode && cityCode) {
      // Find users in this specific Barangay AND City
      // (Using both prevents mixing up "Brgy San Jose" from different cities)
      const usersInBarangay = await UserModel.find({
        'location.cityCode': cityCode,
        'location.barangayCode': barangayCode,
      }).select('_id');

      const localUserIds = usersInBarangay.map((u) => u._id);

      // Restrict query to ONLY neighbors
      query.userId = { $in: localUserIds };
    }
    // Fallback: If only city is provided (optional, if you want mixed modes)
    else if (cityCode) {
      const usersInCity = await UserModel.find({
        'location.cityCode': cityCode,
      }).select('_id');
      query.userId = { $in: usersInCity.map((u) => u._id) };
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }; // Case-insensitive

      const matchingUsers = await UserModel.find({
        householdName: searchRegex,
      }).select('_id');

      const matchingUserIds = matchingUsers.map((user) => user._id);

      query.$or = [
        { caption: searchRegex }, // 1. Match Caption
        { 'bagSnapshot.name': searchRegex }, // 2. Match Item Name
        { 'bagSnapshot.category': searchRegex }, // 3. Match Category
        { userId: { $in: matchingUserIds } },
      ];
    }

    // 2. Execute Query & Count in Parallel
    const [posts, total] = await Promise.all([
      PostModel.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'householdName profileImage points') // Ensure points are fetched for ranking
        .lean(),
      PostModel.countDocuments(query),
    ]);

    return { posts, total };
  }

  async findAllLatestUnique({
    page,
    limit,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    barangayCode,
    cityCode,
  }: GetPostsQuery) {
    const skip = (page - 1) * limit;
    const sortDirection = order === 'desc' ? -1 : 1;

    // 1. STAGE: Initial Match (Optimization)
    // Filter by barangayCode BEFORE grouping. This uses the index on Post and is much faster.
    const initialMatch: any = {};
    if (barangayCode) {
      initialMatch.barangayCode = barangayCode;
    }

    // 2. STAGE: Post-Lookup Match
    // These filters require User data or full text search, so they happen later.
    const matchStage: any = {};

    // Filter by City Code (Found on the joined 'userId' object)
    if (cityCode) {
      matchStage['userId.location.cityCode'] = cityCode;
    }

    if (search) {
      matchStage.$or = [
        { caption: { $regex: search, $options: 'i' } },
        { 'userId.householdName': { $regex: search, $options: 'i' } },
      ];
    }

    const pipeline: any[] = [
      // A. Apply Barangay Filter First
      { $match: initialMatch },

      { $sort: { createdAt: -1 } },

      {
        $group: {
          _id: '$userId',
          doc: { $first: '$$ROOT' },
        },
      },

      { $replaceRoot: { newRoot: '$doc' } },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },

      { $unwind: '$userId' },

      // B. Apply City Filter and Search (after user is joined)
      { $match: matchStage },

      { $sort: { [sortBy]: sortDirection } },

      {
        $facet: {
          posts: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await PostModel.aggregate(pipeline);

    return {
      posts: result.posts,
      total: result.totalCount[0]?.count || 0,
    };
  }
  async findAllUserPosts(userId: string, options: GetPostsQuery) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = options;

    const skip = (page - 1) * limit;
    const sortDirection = order === 'desc' ? -1 : 1;

    const query = { userId: new mongoose.Types.ObjectId(userId) };

    const [posts, total] = await Promise.all([
      PostModel.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'householdName profileImage points')
        .lean(),
      PostModel.countDocuments(query),
    ]);

    return { posts, total };
  }

  async findLatestByUserId(userId: string): Promise<IPost | null> {
    return PostModel.findOne({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Finds a single post by its ID.
   */
  async findById(postId: string): Promise<IPost | null> {
    return PostModel.findById(postId);
  }

  /**
   * Alias for findById to maintain compatibility with existing service calls
   */
  async findPostById(postId: string): Promise<IPost | null> {
    return this.findById(postId);
  }

  /**
   * Finds a post by its Cloudinary image ID.
   * Used to check if an image has been posted to the community.
   */
  async findByImageId(imageId: string): Promise<IPost | null> {
    return PostModel.findOne({ imageId });
  }

  /**
   * Creates a new post with a snapshot of the user's current GoBag items.
   * If user has no GoBag, creates post with empty bagSnapshot.
   */
  async create(data: CreatePostRequest) {
    const { userId, imageUrl, imageId, barangayCode } = data;

    // 1. Get the user's current GoBag
    const goBag = await GoBagModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // 2. Create bagSnapshot - empty array if user has no GoBag yet
    let bagSnapshot: { itemId: string; name: string; category: string }[] = [];

    if (goBag && goBag.items.length > 0) {
      // 3. Get the items from the GoBag and create a deep copy (snapshot)
      const items = await GoBagItemModel.find({
        _id: { $in: goBag.items },
      });

      // 4. Map each item to a snapshot object
      bagSnapshot = items.map((item) => ({
        itemId: String(item._id),
        name: item.name,
        category: item.category,
      }));
    }

    // 5. Create and save the new post
    const post = new PostModel({
      userId: new mongoose.Types.ObjectId(userId),
      caption: data.caption,
      imageUrl,
      imageId,
      bagSnapshot,
      verifiedItemCount: 0,
      verificationCount: 0,
      barangayCode,
    });

    return post.save();
  }

  /**
   * Updates the verification statistics for a post.
   * Called after ratings are added/updated to recalculate averages.
   */
  async updatePostStats(
    postId: string,
    verifiedItemCount: number,
    verificationCount: number,
  ): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(
      postId,
      {
        verifiedItemCount,
        verificationCount,
      },
      { new: true },
    );
  }

  /**
   * Update a User's GoBag points
   */
  async updateUserGoBagPoints(
    userId: string,
    pointsDelta: number,
  ): Promise<void> {
    if (pointsDelta === 0) return;

    await UserModel.findByIdAndUpdate(userId, {
      $inc: { 'points.goBag': pointsDelta },
    });
  }

  async findByIdAndDelete(postId: string) {
    return PostModel.findByIdAndDelete(postId);
  }
}
