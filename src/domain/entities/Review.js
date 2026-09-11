class Review {
  constructor(id, reviewerId, sellerId, rating, comment, createdAt) {
    this.id = id;
    this.reviewerId = reviewerId;
    this.sellerId = sellerId;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt;
  }
}

module.exports = { Review };