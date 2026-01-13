import { Types } from 'mongoose';

import GoBagModel, { IGoBag } from '../models/goBag.model.js';
import GoBagItemModel, { IGoBagItem } from '../models/goBagItem.model.js';

export default class GoBagRepository {
  async findAllCatalogItems(): Promise<IGoBagItem[]> {
    return GoBagItemModel.find({}).lean() as unknown as IGoBagItem[];
  }

  // --- User Bag Operations ---

  async findBagByUserId(userId: string): Promise<IGoBag | null> {
    return GoBagModel.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          items: [],
          imageUrl: 'pending',
          imageId: null,
          lastUpdated: new Date(),
        },
      },
      { upsert: true, new: true },
    );
  }

  // Atomic Add (Idempotent)
  async addItemToBag(userId: string, itemId: string): Promise<void> {
    await GoBagModel.updateOne(
      { userId },
      { $addToSet: { items: itemId } },
      { upsert: true },
    );
  }

  // Atomic Remove
  async removeItemFromBag(userId: string, itemId: string): Promise<void> {
    await GoBagModel.updateOne({ userId }, { $pull: { items: itemId } });
  }

  // Get go bag image details only
  async getGoBagImage(
    userId: string,
  ): Promise<{ imageUrl: string; imageId: string | null } | null> {
    const goBag = await GoBagModel.findOne({ userId }).select(
      'imageUrl imageId',
    );
    if (!goBag) return null;
    return {
      imageUrl: goBag.imageUrl || '',
      imageId: goBag.imageId || null,
    };
  }

  /**
   * Unified Update: Updates both the Items list and the Image details
   */
  async updateFullGoBag(
    userId: string,
    items: string[],
    imageUrl: string,
    imageId: string,
  ): Promise<IGoBag | null> {
    return GoBagModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          items: items,
          imageUrl: imageUrl,
          imageId: imageId, // Store the publicId for future deletion
          lastUpdated: new Date(),
        },
      },
      { new: true, upsert: true },
    );
  }

  /**
   * Retrieves high-level Go Bag readiness statistics for a specific LGU.
   */
  async getLguStats(lguId: Types.ObjectId, totalPossibleItems: number) {
    return GoBagModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      { $match: { 'userDetails.lguId': lguId } },
      {
        $addFields: {
          convertedItemIds: {
            $map: {
              input: { $ifNull: ['$items', []] },
              as: 'itemId',
              in: { $toObjectId: '$$itemId' },
            },
          },
        },
      },
      {
        $addFields: {
          score: {
            $cond: [
              { $eq: [totalPossibleItems, 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      { $size: '$convertedItemIds' },
                      totalPossibleItems,
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]);
  }

  /**
   * Generates a frequency breakdown of specific items owned by residents of an LGU.
   */
  async getItemBreakdown(lguId: Types.ObjectId, activeBagsCount: number) {
    return GoBagModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      { $match: { 'userDetails.lguId': lguId } },
      {
        $project: {
          convertedItems: {
            $map: {
              input: { $ifNull: ['$items', []] },
              as: 'itemId',
              in: { $toObjectId: '$$itemId' },
            },
          },
        },
      },
      { $unwind: '$convertedItems' },
      { $group: { _id: '$convertedItems', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'gobagitems',
          localField: '_id',
          foreignField: '_id',
          as: 'details',
        },
      },
      { $unwind: '$details' },
      {
        $project: {
          name: '$details.name',
          rawCount: '$count',
          count: {
            $round: [
              {
                $multiply: [{ $divide: ['$count', activeBagsCount || 1] }, 100],
              },
              0,
            ],
          },
        },
      },
      { $sort: { rawCount: -1 } },
    ]);
  }

  /**
   * Fetches a paginated list of Go Bags for residents within a specific LGU.
   * Hydrates the response with detailed user info, authoritative LGU location
   * data, and full item details while calculating real-time completeness.
   */
  async getResidentGoBags(
    lguId: string,
    skip: number,
    limit: number,
    totalPossibleItems: number,
  ) {
    return GoBagModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $match: {
          'userDetails.lguId': new Types.ObjectId(lguId),
        },
      },
      {
        $lookup: {
          from: 'lgus',
          localField: 'userDetails.lguId',
          foreignField: '_id',
          as: 'lguDetails',
        },
      },
      { $unwind: '$lguDetails' },
      {
        $addFields: {
          convertedItemIds: {
            $map: {
              input: { $ifNull: ['$items', []] },
              as: 'itemId',
              in: { $toObjectId: '$$itemId' },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'gobagitems',
          localField: 'convertedItemIds',
          foreignField: '_id',
          as: 'itemDetails',
        },
      },
      {
        $project: {
          _id: 1,
          imageUrl: 1,
          lastUpdated: 1,
          completeness: {
            $cond: {
              if: { $eq: [totalPossibleItems, 0] },
              then: 0,
              else: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $size: '$itemDetails' },
                          totalPossibleItems,
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },
          userId: {
            _id: '$userDetails._id',
            householdName: '$userDetails.householdName',
            email: '$userDetails.email',
            phoneNumber: '$userDetails.phoneNumber',
            location: {
              region: '$lguDetails.region',
              province: '$lguDetails.province',
              city: '$lguDetails.city',
              barangay: '$lguDetails.barangay',
            },
            profileImage: '$userDetails.profileImage',
          },
          items: {
            $map: {
              input: '$itemDetails',
              as: 'item',
              in: {
                _id: '$$item._id',
                name: '$$item.name',
                category: '$$item.category',
              },
            },
          },
        },
      },
      { $sort: { lastUpdated: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);
  }
}
