import { Router } from "express";
import QuizController from "../controllers/quiz.controller";

const quizRoutes = Router();
const controller = new QuizController();

export default quizRoutes;
