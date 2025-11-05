import { Router } from "express";
import RatingController from "../controllers/rating.controller";

const ratingRoutes = Router();
const controller = new RatingController();

export default ratingRoutes;
