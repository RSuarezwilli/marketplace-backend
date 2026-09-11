const { Review } = require('../../domain/entities/Review');

class SellerNotFoundError extends Error {
  constructor(sellerId) {
    super(`Vendedor ${sellerId} no encontrado`);
    this.name = 'SellerNotFoundError';
  }
}

class CannotReviewSelfError extends Error {
  constructor() {
    super('No puedes dejarte una reseña a ti mismo');
    this.name = 'CannotReviewSelfError';
  }
}

class ReviewService {
  constructor(reviewRepository, userRepository) {
    this.reviewRepository = reviewRepository;
    this.userRepository = userRepository;
  }

  async createReview(reviewerId, sellerId, input) {
    if (reviewerId === sellerId) {
      throw new CannotReviewSelfError();
    }

    const seller = await this.userRepository.findById(sellerId);
    if (!seller) {
      throw new SellerNotFoundError(sellerId);
    }

    const review = new Review('', reviewerId, sellerId, input.rating, input.comment ?? null, new Date());
    return this.reviewRepository.create(review);
  }

  async listSellerReviews(sellerId) {
    return this.reviewRepository.listBySeller(sellerId);
  }

  async getSellerRating(sellerId) {
    return this.reviewRepository.getAverageRating(sellerId);
  }
}

module.exports = { ReviewService, SellerNotFoundError, CannotReviewSelfError };