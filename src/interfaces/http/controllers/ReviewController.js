const { createReviewSchema } = require('../../../application/validators/reviewValidators');

class ReviewController {
  constructor(reviewService) {
    this.reviewService = reviewService;

    this.create = this.create.bind(this);
    this.listBySeller = this.listBySeller.bind(this);
    this.getSellerRating = this.getSellerRating.bind(this);
  }

  async create(req, res, next) {
    try {
      const input = createReviewSchema.parse(req.body);
      const review = await this.reviewService.createReview(req.currentUser.id, req.params.sellerId, input);
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  }

  async listBySeller(req, res, next) {
    try {
      const reviews = await this.reviewService.listSellerReviews(req.params.sellerId);
      res.status(200).json(reviews);
    } catch (err) {
      next(err);
    }
  }

  async getSellerRating(req, res, next) {
    try {
      const rating = await this.reviewService.getSellerRating(req.params.sellerId);
      res.status(200).json(rating);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { ReviewController };