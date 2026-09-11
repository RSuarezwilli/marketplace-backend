const { z } = require('zod');

const createProductSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  price: z.number().positive(),
  stock: z.number().int().nonnegative()
});

const updateProductSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().min(10).max(2000).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviarse al menos un campo para actualizar'
  });

module.exports = { createProductSchema, updateProductSchema };