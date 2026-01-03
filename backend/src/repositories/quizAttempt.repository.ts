import { QuizAttemptResult } from '@repo/shared/dist/schemas/quizAttempt.schema';

import QuizAttempt from '../models/quizAttempt.model.js';

export default class QuizAttemptRepository {
  async createQuizAttempt(quizAttempt: QuizAttemptResult) {
    return QuizAttempt.create(quizAttempt);
  }

  async getQuizAttemptById(id: string) {
    return QuizAttempt.findById(id).populate('quiz').populate('user');
  }

  async getQuizAttemptsByUserId(userId: string) {
    return QuizAttempt.find({ user: userId }).populate('quiz').populate('user');
  }

  async getQuizAttemptsByQuizId(quizId: string) {
    return QuizAttempt.find({ quiz: quizId }).populate('quiz').populate('user');
  }

  async getQuizAttempts(userId: string, moduleId: string) {
    return QuizAttempt.find().populate('quiz').populate('user');
  }

  async deleteQuizAttempt(id: string) {
    return QuizAttempt.findByIdAndDelete(id);
  }
}
