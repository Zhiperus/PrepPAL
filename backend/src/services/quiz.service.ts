import { NotFoundError } from '../errors/index.js';
import { IQuiz } from '../models/quiz.model.js';
import QuizRepository from '../repositories/quiz.repository.js';

export default class QuizService {
  private quizRepo = new QuizRepository();

  async getQuiz(moduleId: string) {
    return this.quizRepo.getQuizByModuleId(moduleId);
  }

  /* --- Admin Methods --- */

  async createQuiz(data: any) {
    // Check if a quiz already exists for this module?
    // MongoDB unique index on moduleId will handle duplicates (throw error)
    return this.quizRepo.create(data);
  }

  async updateQuiz(id: string, data: any) {
    const existing = await this.quizRepo.getQuizById(id);

    if (!existing) {
      throw new NotFoundError('Quiz not found');
    }

    return this.quizRepo.update(id, data);
  }

  async deleteQuiz(id: string) {
    const existing = await this.quizRepo.getQuizById(id);

    if (!existing) {
      throw new NotFoundError('Quiz not found');
    }

    return this.quizRepo.deleteQuiz(id);
  }
}
