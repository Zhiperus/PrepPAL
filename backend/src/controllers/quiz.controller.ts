import { Request, Response } from "express";

import QuizService from '../services/quiz.service.js';

export default class QuizController {
  private quizService = new QuizService();
}
