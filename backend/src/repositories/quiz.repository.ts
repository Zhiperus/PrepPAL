import QuizModel, { IQuiz } from '../models/quiz.model.js';

export default class QuizRepository {
  async getQuizById(id: string): Promise<IQuiz | null> {
    return QuizModel.findById(id).exec();
  }

  async getQuizByModuleId(moduleId: string): Promise<IQuiz | null> {
    return QuizModel.findOne({ moduleId }).exec();
  }

  async create(data: any) {
    return QuizModel.create(data);
  }

  async update(id: string, data: any) {
    return QuizModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteQuiz(id: string) {
    return QuizModel.findByIdAndDelete(id);
  }
}
