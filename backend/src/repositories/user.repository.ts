import {
  CreateLguAccountRequest,
  GetLeaderboardQuery,
  UpdateModuleProgressInput,
  UpdateProfileInfoRequest,
} from '@repo/shared/dist/schemas/user.schema';
import { Types } from 'mongoose';

import UserModel, { CitizenModel, IUser } from '../models/user.model.js';

export default class UserRepository {
  async findById(userId: string) {
    return UserModel.findById(userId);
  }

  async getUserRank(userId: string) {
    // 1. Fetch the user first to get their location
    const user = await this.findById(userId);
    if (!user || !user.location) return null;

    const pipeline: any[] = [
      // 2. SCOPE: Filter users to ONLY those in the same Barangay/City
      {
        $match: {
          'location.city': user.location.city,
          'location.barangay': user.location.barangay,
          // Optional: Ensure we only rank citizens, not admins/LGUs
          role: 'citizen',
        },
      },
      // 3. Calculate Total Points
      {
        $addFields: {
          totalScore: {
            $add: [
              { $ifNull: ['$points.goBag', 0] },
              { $ifNull: ['$points.modules', 0] },
              { $ifNull: ['$points.community', 0] },
            ],
          },
        },
      },
      // 4. Sort by highest score
      { $sort: { totalScore: -1 } },
      // 5. Assign Rank
      {
        $setWindowFields: {
          sortBy: { totalScore: -1 },
          output: {
            rank: {
              $rank: {},
            },
          },
        },
      },
      // 6. Find the specific user again to extract their new rank
      { $match: { _id: new Types.ObjectId(userId) } },
      // 7. Return result
      { $project: { rank: 1, totalScore: 1 } },
    ];
    const result = await UserModel.aggregate(pipeline);
    return result[0] || null; // Return the first result or null if not found
  }

  async updateUserGoBagPoints(userId: string, pointsToAdd: number) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $inc: { 'points.goBag': pointsToAdd }, // Atomically increment
      },
      { new: true },
    );
  }

  async updateOnboardingDetails(userId: string, data: Partial<IUser>) {
    return CitizenModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...data,
          onboardingCompleted: true,
        },
      },
      { new: true },
    );
  }

  async updateAvatar(
    userId: string,
    profileImage: string,
    profileImageId: string,
  ) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          profileImage: profileImage,
          profileImageId: profileImageId,
        },
      },
      { new: true },
    );
  }

  async updateProfileInfo(userId: string, data: UpdateProfileInfoRequest) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $set: data,
      },
      { new: true },
    );
  }

  async getLeaderboard(query: GetLeaderboardQuery) {
    const { sortBy, order, limit, region, province, city, barangay } = query;
    const sortDirection = order === 'desc' ? -1 : 1;
    const finalLimit = limit ?? 10;

    // Build the filter object dynamically
    const filter: any = {};
    if (city) filter['location.city'] = city;
    if (province) filter['location.province'] = province;
    if (region) filter['location.region'] = region;
    if (barangay) filter['location.barangay'] = barangay;

    // Check if the we are using combined points
    if (sortBy === 'totalPoints') {
      return UserModel.aggregate([
        { $match: filter },
        {
          $addFields: {
            totalPoints: {
              $add: [
                { $ifNull: ['$points.goBag', 0] },
                { $ifNull: ['$points.community', 0] },
                { $ifNull: ['$points.modules', 0] },
              ],
            },
          },
        },
        { $sort: { totalPoints: sortDirection } },
        { $limit: finalLimit },
        {
          $project: {
            _id: 0, // hide
            id: '$_id', // Rename _id to id for the frontend
            householdName: 1, // Set to 1 to show
            location: 1,
            points: 1,
            totalPoints: 1,
            profileImage: 1,
          },
        },
      ]);
    }
    return UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .limit(finalLimit)
      .select('id email points location householdName profileImage')
      .lean({ virtuals: true })
      .exec();
  }

  async updateModuleProgress(data: UpdateModuleProgressInput) {
    const { userId, moduleId, newScore, pointsToAward } = data;

    // 1. Try to update an existing entry
    const result = await UserModel.updateOne(
      {
        _id: userId,
        'completedModules.moduleId': moduleId,
      },
      {
        // $max ensures we never overwrite a 90% with a 70%
        $max: { 'completedModules.$.bestScore': newScore },
        $inc: { 'points.modules': pointsToAward },
      },
    );

    // 2. If the module wasn't in the array yet, add it
    if (result.matchedCount === 0) {
      return await UserModel.updateOne(
        { _id: userId },
        {
          $push: {
            completedModules: {
              completedAt: new Date(),
              moduleId,
              bestScore: newScore,
              pointsAwarded: pointsToAward,
            },
          },
          $inc: { 'points.modules': pointsToAward },
        },
      );
    }
    return result;
  }

  async findLguAccounts(query: any, page: number = 1, limit: number = 10) {
    return UserModel.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
  }

  async getCitizenCountByLgu(barangayCode: string) {
    return UserModel.countDocuments({
      'location.barangayCode': barangayCode,
      role: 'citizen',
    });
  }

  async findByEmail(query: any) {
    return UserModel.findOne(query);
  }

  async createLguAccount(data: CreateLguAccountRequest) {
    return UserModel.create(data);
  }
}
