import { Request, Response } from "express";

import RatingService from '../services/rating.service.js';

export default class RatingController {
  private ratingService = new RatingService();
}
