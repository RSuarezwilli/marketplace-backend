const { ReviewService, SellerNotFoundError, CannotReviewSelfError } = require('../../../src/application/services/ReviewService');
const { InMemoryReviewRepository } = require('../doubles/InMemoryReviewRepository');
const { InMemoryUserRepository } = require('../doubles/InMemoryUserRepository');
const { User } = require('../../../src/domain/entities/User');

describe('ReviewService', () => {
  let reviewRepository;
  let userRepository;
  let service;
  let seller;
  let buyer;

  beforeEach(async () => {
    reviewRepository = new InMemoryReviewRepository();
    userRepository = new InMemoryUserRepository();
    service = new ReviewService(reviewRepository, userRepository);

    seller = await userRepository.create(
      User.fromSupabaseAuthPayload({
        id: 'auth-seller-1',
        email: 'vendedor@example.com',
        created_at: '2026-01-01T00:00:00.000Z'
      })
    );
    buyer = await userRepository.create(
      User.fromSupabaseAuthPayload({
        id: 'auth-buyer-1',
        email: 'comprador@example.com',
        created_at: '2026-01-01T00:00:00.000Z'
      })
    );
  });

  it('crea una reseña válida (HU-17)', async () => {
    const review = await service.createReview(buyer.id, seller.id, {
      rating: 5,
      comment: 'Excelente vendedor, todo perfecto'
    });

    expect(review.rating).toBe(5);
    expect(review.reviewerId).toBe(buyer.id);
    expect(review.sellerId).toBe(seller.id);
  });

  it('permite crear una reseña sin comentario (el comentario es opcional)', async () => {
    const review = await service.createReview(buyer.id, seller.id, { rating: 4 });
    expect(review.comment).toBeNull();
  });

  it('lanza CannotReviewSelfError si el comprador y el vendedor son el mismo usuario', async () => {
    await expect(service.createReview(seller.id, seller.id, { rating: 5 })).rejects.toBeInstanceOf(
      CannotReviewSelfError
    );
  });

  it('lanza SellerNotFoundError si el vendedor no existe', async () => {
    await expect(service.createReview(buyer.id, 'no-existe', { rating: 3 })).rejects.toBeInstanceOf(
      SellerNotFoundError
    );
  });

  it('listSellerReviews() (HU-17) retorna solo las reseñas de ese vendedor', async () => {
    const otroVendedor = await userRepository.create(
      User.fromSupabaseAuthPayload({
        id: 'auth-seller-2',
        email: 'otro-vendedor@example.com',
        created_at: '2026-01-01T00:00:00.000Z'
      })
    );

    await service.createReview(buyer.id, seller.id, { rating: 5, comment: 'Para el vendedor 1' });
    await service.createReview(buyer.id, otroVendedor.id, { rating: 2, comment: 'Para el vendedor 2' });

    const reviews = await service.listSellerReviews(seller.id);
    expect(reviews).toHaveLength(1);
    expect(reviews[0].comment).toBe('Para el vendedor 1');
  });

  it('getSellerRating() (HU-18) calcula el promedio correctamente', async () => {
    const otroComprador = await userRepository.create(
      User.fromSupabaseAuthPayload({
        id: 'auth-buyer-2',
        email: 'comprador2@example.com',
        created_at: '2026-01-01T00:00:00.000Z'
      })
    );

    await service.createReview(buyer.id, seller.id, { rating: 5 });
    await service.createReview(otroComprador.id, seller.id, { rating: 3 });

    const rating = await service.getSellerRating(seller.id);
    expect(rating.average).toBe(4);
    expect(rating.count).toBe(2);
  });

  it('getSellerRating() (HU-18) retorna 0 y count 0 si el vendedor no tiene reseñas', async () => {
    const rating = await service.getSellerRating(seller.id);
    expect(rating.average).toBe(0);
    expect(rating.count).toBe(0);
  });
});