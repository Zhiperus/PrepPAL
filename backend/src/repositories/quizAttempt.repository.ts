import { QuizAttemptResult } from '@repo/shared/dist/schemas/quizAttempt.schema';
import mongoose from 'mongoose';

import QuizAttempt, { IQuizAttempt } from '../models/quizAttempt.model.js';

export default class QuizAttemptRepository {
  async createQuizAttempt(quizAttempt: QuizAttemptResult) {
    return QuizAttempt.create(quizAttempt);
  }

  async getQuizAttemptById(id: string) {
    return await QuizAttempt.findById(id)
      .populate('quizId')
      .populate('userId')
      .exec();
  }

  async getAllQuizAttempts(): Promise<IQuizAttempt[]> {
    return await QuizAttempt.find({})
      .sort({ createdAt: -1 })
      .populate('quizId')
      .exec();
  }

  async getQuizAttemptsByUserId(userId: string): Promise<IQuizAttempt[]> {
    return await QuizAttempt.find({
      userId: userId,
    })
      .sort({ createdAt: -1 })
      .populate('quizId')
      .exec();
  }

  async getQuizAttemptsByQuizId(quizId: string): Promise<IQuizAttempt[]> {
    return await QuizAttempt.find({
      quizId: quizId,
    })
      .sort({ createdAt: -1 })
      .populate('quizId')
      .exec();
  }

  async getQuizAttemptsByUserAndQuizId(
    userId: string,
    quizId: string,
  ): Promise<IQuizAttempt[]> {
    return await QuizAttempt.find({
      userId: userId,
      quizId: quizId,
    })
      .sort({ createdAt: -1 })
      .populate('quizId')
      .exec();
  }

  async deleteQuizAttempt(id: string) {
    return await QuizAttempt.findByIdAndDelete(id).exec();
  }
}
