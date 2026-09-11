const { Review } = require('../../domain/entities/Review');

const TABLE = 'reviews';

function rowToEntity(row) {
  return new Review(row.id, row.reviewer_id, row.seller_id, row.rating, row.comment, new Date(row.created_at));
}

class SupabaseReviewRepository {
  constructor(client) {
    this.client = client;
  }

  async create(review) {
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        reviewer_id: review.reviewerId,
        seller_id: review.sellerId,
        rating: review.rating,
        comment: review.comment
      })
      .select('*')
      .single();

    if (error) throw new Error(`Error creando reseña: ${error.message}`);
    return rowToEntity(data);
  }

  async listBySeller(sellerId) {
    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error listando reseñas: ${error.message}`);
    return data.map(rowToEntity);
  }

  async getAverageRating(sellerId) {
    const { data, error } = await this.client.from(TABLE).select('rating').eq('seller_id', sellerId);

    if (error) throw new Error(`Error calculando calificación promedio: ${error.message}`);
    if (!data || data.length === 0) return { average: 0, count: 0 };

    const sum = data.reduce((acc, row) => acc + row.rating, 0);
    return { average: sum / data.length, count: data.length };
  }
}

module.exports = { SupabaseReviewRepository };