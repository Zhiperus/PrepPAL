import QuizRepository from '../repositories/quiz.repository.js';

export default class QuizService {
  private quizRepo = new QuizRepository();

  async getQuiz(moduleId: string) {
    return this.quizRepo.getQuizByModuleId(moduleId);
  }
}
