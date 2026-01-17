import { z } from 'zod';

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  color: z.string().regex(hexColorRegex, 'Cor deve ser um código hex válido (#RRGGBB)').optional(),
  parentId: z.string().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
