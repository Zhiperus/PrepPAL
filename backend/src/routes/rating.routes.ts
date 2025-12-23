import { Router } from 'express';

import RatingController from '../controllers/rating.controller.js';

const ratingRoutes: Router = Router();
const controller = new RatingController();

export default ratingRoutes;
