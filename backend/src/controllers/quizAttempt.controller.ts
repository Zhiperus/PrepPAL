import { Request, Response } from 'express';

import QuizAttemptService from '../services/quizAttempt.service.js';

export default class QuizAttemptController {
  private quizAttemptService = new QuizAttemptService();
  async getAllQuizAttempts(req: Request, res: Response) {
    const attempts = await this.quizAttemptService.getAllQuizAttempts();
    res.status(200).json({
      success: true,
      data: attempts,
    });
  }

  async getQuizAttemptsByQuizId(req: Request, res: Response) {
    const { quizId } = req.params;
    const attempts = await this.quizAttemptService.getQuizAttemptsByQuizId(
      quizId,
    );
    res.status(200).json({
      success: true,
      data: attempts,
    });
  }

  async getQuizAttemptsByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const attempts = await this.quizAttemptService.getQuizAttemptsByUserId(
      userId,
    );
    res.status(200).json({
      success: true,
      data: attempts,
    });
  }
}
