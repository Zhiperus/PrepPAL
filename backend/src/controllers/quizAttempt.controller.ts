import { Request, Response } from "express";
import QuizAttemptService from "../services/quizAttempt.service";

export default class QuizAttemptController {
  private quizAttemptService = new QuizAttemptService();
}
