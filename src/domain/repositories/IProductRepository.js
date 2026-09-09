/**
 * IProductRepository (contrato)
 * -------------------------------
 * Documenta el contrato que debe cumplir cualquier repositorio de productos:
 *
 *   findById(id: string): Promise<Product | null>
 *   create(product: Product): Promise<Product>
 *   update(product: Product): Promise<Product>
 *   delete(id: string): Promise<void>
 *   listBySeller(sellerId: string): Promise<Product[]>
 *   listAvailable(limit?: number, offset?: number): Promise<Product[]>
 *
 * Ver la nota completa en IUserRepository.js sobre por qué se documenta así
 * en JavaScript en lugar de usar una interfaz de TypeScript.
 */

module.exports = {};
