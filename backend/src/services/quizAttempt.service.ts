import { QuizAttemptInput } from '@repo/shared/dist/schemas/quizAttempt.schema';
import mongoose from 'mongoose';

import { NotFoundError } from '../errors/index.js';
import UserModel from '../models/user.model.js';
import ModuleRepository from '../repositories/module.repository.js';
import QuizRepository from '../repositories/quiz.repository.js';
import QuizAttemptRepository from '../repositories/quizAttempt.repository.js';

export default class QuizAttemptService {
  private quizAttemptRepo = new QuizAttemptRepository();
  private quizRepo = new QuizRepository();
  private moduleRepo = new ModuleRepository();

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
      quizId: (quiz._id as unknown as mongoose.Types.ObjectId).toString(),
      answersSubmitted: gradedAnswers,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      createdAt: new Date(),
    });

    const totalModules = await this.moduleRepo.countAll();
    const moduleWeight = 50 / (totalModules || 1);
    const currentWeightedScore = (score / 100) * moduleWeight;

    const pointsAwarded = await this.calculatePointImprovement(
      userId,
      moduleId,
      score, // Save 100% in the array
      currentWeightedScore, // Add 8.33 to the points balance
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
    newScore: number, // e.g., 100
    weightedValue: number, // e.g., 8.33
  ) {
    const user = await UserModel.findById(userId);
    if (!user) return 0;

    // 1. Get the current total module count for the math
    const totalCount = await this.moduleRepo.countAll();
    const MAX_MODULE_POINTS = 50;
    const pointsPerModule = MAX_MODULE_POINTS / (totalCount || 1);

    const existingModule = user.completedModules.find(
      (m) => m.moduleId.toString() === moduleId,
    );

    let pointsToAdd = 0;

    if (existingModule) {
      // 2. Only update if they improved their actual percentage score
      if (newScore > existingModule.bestScore) {
        // Calculate exactly how many points they ALREADY had for this module
        const oldWeightedValue =
          (existingModule.bestScore / 100) * pointsPerModule;

        // The improvement is the difference
        pointsToAdd = weightedValue - oldWeightedValue;

        // Update the record with the new 0-100 percentage
        existingModule.bestScore = newScore;
      }
    } else {
      // 3. First time completing this specific module
      pointsToAdd = weightedValue;
      user.completedModules.push({
        moduleId,
        bestScore: newScore, // Save 100 here, not 8.33
        pointsAwarded: weightedValue, // The weighted points (e.g., 8.33)
      });
    }

    // 4. Update the user's total points balance (the one shown on the dashboard)
    // Use Math.min to ensure we never accidentally go over 50 due to rounding
    user.points.modules = Math.min(
      user.points.modules + pointsToAdd,
      MAX_MODULE_POINTS,
    );

    await user.save();
    return pointsToAdd;
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
