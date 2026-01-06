import {
  GetLeaderboardQuery,
  UpdateProfileInfoRequest,
} from '@repo/shared/dist/schemas/user.schema';

import mongoose from 'mongoose';

import QuizAttempt from '../models/quizAttempt.model.js';
import UserModel, { IUser } from '../models/user.model.js';

export default class UserRepository {
  async findById(userId: string) {
    return UserModel.findById(userId);
  }

  async getUserStats(userId: string) {
    // Fetch user points
    const user = await UserModel.findById(userId).select('points').lean();

    const totalPoints = user
      ? (user.points?.goBag || 0) +
        (user.points?.community || 0) +
        (user.points?.modules || 0)
      : 0;

    // Count distinct completed modules by looking at quiz attempts -> quiz -> moduleId
    const objectId = new mongoose.Types.ObjectId(userId);

    const modulesAgg = await QuizAttempt.aggregate([
      { $match: { userId: objectId } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quiz',
        },
      },
      { $unwind: '$quiz' },
      { $match: { 'quiz.moduleId': { $exists: true, $ne: null } } },
      { $group: { _id: '$quiz.moduleId' } },
      { $count: 'completedModules' },
    ]);

    const completedModules =
      (modulesAgg[0] && modulesAgg[0].completedModules) || 0;

    return { totalPoints, completedModules };
  }

  async getUserCompletedQuizzes(userId: string, minScore: number = 70) {
    const objectId = new mongoose.Types.ObjectId(userId);

    const agg = await QuizAttempt.aggregate([
      { $match: { userId: objectId } },
      {
        $addFields: {
          correctCount: {
            $size: {
              $filter: {
                input: '$answers',
                as: 'ans',
                cond: { $eq: ['$$ans.answer', '$$ans.correctAnswer'] },
              },
            },
          },
          totalCount: { $size: '$answers' },
        },
      },
      {
        $addFields: {
          scorePct: {
            $cond: [
              { $gt: ['$totalCount', 0] },
              {
                $multiply: [{ $divide: ['$correctCount', '$totalCount'] }, 100],
              },
              0,
            ],
          },
        },
      },
      { $group: { _id: '$quizId', bestScore: { $max: '$scorePct' } } },
      { $match: { bestScore: { $gte: minScore } } },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quiz',
        },
      },
      { $unwind: '$quiz' },
      {
        $project: {
          _id: 0,
          quizId: '$_id',
          bestScore: 1,
          'quiz.moduleId': 1,
          'quiz.questions': 1,
        },
      },
    ]);

    // Map to a friendly shape
    return agg.map((item: any) => ({
      quizId: item.quizId.toString(),
      moduleId: item.quiz?.moduleId?.toString?.() ?? null,
      bestScore: item.bestScore,
      questionCount: item.quiz?.questions?.length ?? 0,
    }));
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
    return UserModel.findByIdAndUpdate(
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
    const filter: Record<string, unknown> = {};
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

  async getTopLeaderboard(limit: number = 50) {
    return UserModel.aggregate([
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
      { $sort: { totalPoints: -1 } },
      { $limit: limit },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            {
              $project: {
                _id: 0,
                id: '$_id',
                rank: { $add: [{ $indexOfArray: [[], 0] }, 1] }, // Placeholder, will use $setWindowFields
                householdName: 1,
                location: 1,
                points: 1,
                totalPoints: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
    ]);
  }
}
