import { z } from 'zod';

export const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const CreateTransactionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  value: z.number().positive('Valor deve ser positivo'),
  type: TransactionTypeEnum,
  date: z.string().datetime().optional(),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().optional(),
});

export const UpdateTransactionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  value: z.number().positive().optional(),
  type: TransactionTypeEnum.optional(),
  date: z.string().datetime().optional(),
  categoryId: z.string().nullable().optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
