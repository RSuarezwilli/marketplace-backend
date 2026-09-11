const { Review } = require('../../../src/domain/entities/Review');

let idCounter = 0;

class InMemoryReviewRepository {
  constructor() {
    this.reviews = [];
  }

  async create(review) {
    idCounter += 1;
    const persisted = new Review(
      `review-${idCounter}`,
      review.reviewerId,
      review.sellerId,
      review.rating,
      review.comment,
      review.createdAt
    );
    this.reviews.push(persisted);
    return persisted;
  }

  async listBySeller(sellerId) {
    return this.reviews.filter((r) => r.sellerId === sellerId);
  }

  async getAverageRating(sellerId) {
    const sellerReviews = this.reviews.filter((r) => r.sellerId === sellerId);
    if (sellerReviews.length === 0) return { average: 0, count: 0 };

    const sum = sellerReviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / sellerReviews.length, count: sellerReviews.length };
  }
}

module.exports = { InMemoryReviewRepository };