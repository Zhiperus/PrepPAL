import { Request, Response } from 'express';

import QuizAttemptService from '../services/quizAttempt.service.js';

export default class QuizAttemptController {
  private quizAttemptService = new QuizAttemptService();
}
