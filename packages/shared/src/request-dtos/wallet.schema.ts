import { z } from 'zod';

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const CreateWalletSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  color: z.string().regex(hexColorRegex, 'Cor deve ser um código hex válido (#RRGGBB)').optional(),
  icon: z.string().max(50).optional(),
});

export const UpdateWalletSchema = CreateWalletSchema.partial();

export type CreateWalletInput = z.infer<typeof CreateWalletSchema>;
export type UpdateWalletInput = z.infer<typeof UpdateWalletSchema>;
