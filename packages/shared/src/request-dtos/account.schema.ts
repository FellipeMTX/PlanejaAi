import { z } from 'zod';

export const CreateAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  balance: z.number().optional().default(0),
});

export const UpdateAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;
