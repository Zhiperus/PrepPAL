import QuizModel, { IQuiz } from '../models/quiz.model.js';
import Quiz from '../models/quiz.model.js';

export default class QuizRepository {
  async getQuizById(id: string): Promise<IQuiz | null> {
    return QuizModel.findById(id).exec();
  }

  async getQuizByModuleId(moduleId: string): Promise<IQuiz | null> {
    return QuizModel.findOne({ moduleId }).exec();
  }

  async deleteQuiz(id: string) {
    return Quiz.findByIdAndDelete(id);
  }
}
