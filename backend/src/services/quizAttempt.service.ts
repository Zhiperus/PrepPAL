import { QuizAttemptInput } from '@repo/shared/dist/schemas/quizAttempt.schema';
import { UpdateModuleProgressInput } from '@repo/shared/dist/schemas/user.schema';
import mongoose from 'mongoose';

import { NotFoundError } from '../errors/index.js';
import QuizRepository from '../repositories/quiz.repository.js';
import QuizAttemptRepository from '../repositories/quizAttempt.repository.js';
import UserRepository from '../repositories/user.repository.js';

export default class QuizAttemptService {
  private quizAttemptRepo = new QuizAttemptRepository();
  private quizRepo = new QuizRepository();
  private userRepo = new UserRepository();

  async gradeAttempt(
    userId: string,
    moduleId: string,
    userAnswers: QuizAttemptInput['answers'],
  ) {
    // 1. Fetch the Quiz
    const quiz = await this.quizRepo.getQuizByModuleId(moduleId);
    if (!quiz) {
      throw new NotFoundError('No quiz found for this module.');
    }
    // 2. Map and Grade the answers
    let correctCount = 0;
    const gradedAnswers = quiz.questions.map((question, index) => {
      const userAns = userAnswers.find((a) => a.questionIndex === index);
      const isCorrect = userAns?.selectedAnswerId === question.correctAnswer;

      if (isCorrect) correctCount++;

      return {
        questionIndex: index,
        selectedAnswerId: userAns?.selectedAnswerId ?? -1, // Fallback if question was skipped
        isCorrect,
      };
    });

    const score = (correctCount / quiz.questions.length) * 100;
    const passed = score >= 70;

    // 3. Save the attempt to history
    await this.quizAttemptRepo.createQuizAttempt({
      userId,
      quizId: (quiz._id as mongoose.Types.ObjectId).toString(),
      answersSubmitted: gradedAnswers,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      createdAt: new Date(),
    });

    const pointsAwarded = await this.calculatePointImprovement(
      userId,
      moduleId,
      score,
    );

    return {
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
      pointsAwarded,
    };
  }

  async calculatePointImprovement(
    userId: string,
    moduleId: string,
    newScore: number,
  ) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const existingRecord = user.completedModules.find(
      (m) => m.moduleId.toString() === moduleId,
    );

    const previousBest = existingRecord?.bestScore || 0;
    let pointsToAward = 0;

    // Rule: Only award points if they improve their score
    if (newScore > previousBest) {
      const improvement = newScore - previousBest;

      // If you want a max of 10 points per module:
      pointsToAward = Math.round(improvement * 0.1);

      const updateData: UpdateModuleProgressInput = {
        userId: userId,
        moduleId: moduleId,
        newScore: newScore,
        pointsToAward: pointsToAward,
      };

      if (pointsToAward > 0) {
        await this.userRepo.updateModuleProgress(updateData);
      }
    }
    return pointsToAward;
  }

  async getQuizAttemptsByUserAndQuizId(userId: string, quizId: string) {
    const attempts = await this.quizAttemptRepo.getQuizAttemptsByUserAndQuizId(
      userId,
      quizId,
    );
    return attempts;
  }

  async getQuizAttemptsByQuizId(quizId: string) {
    const attempts = await this.quizAttemptRepo.getQuizAttemptsByQuizId(quizId);
    return attempts;
  }

  async getQuizAttemptsByUserId(userId: string) {
    const attempts = await this.quizAttemptRepo.getQuizAttemptsByUserId(userId);
    return attempts;
  }

  async getAllQuizAttempts() {
    const attempts = await this.quizAttemptRepo.getAllQuizAttempts();
    return attempts;
  }
}
