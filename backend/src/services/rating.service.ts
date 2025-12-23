import RatingRepository from '../repositories/rating.repository.js';

export default class RatingService {
  private ratingRepo = new RatingRepository();
}
