import { Injectable, HttpStatus } from '@nestjs/common';
import { Decimal } from '@repo/database';
import { PrismaService } from '../shared/services/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { SimpleErr, FromZodErr } from '@/errors';
import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@repo/shared/request-dtos';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService
  ) {}

  async create(userId: string, data: CreateTransactionInput) {
    const parsed = CreateTransactionSchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    const { name, value, type, date, accountId, categoryId } = parsed.data;

    // Validate account ownership
    await this.accountsService.validateOwnership(userId, accountId);

    // Validate category if provided
    if (categoryId) {
      await this.categoriesService.validateOwnership(userId, categoryId);
    }

    // Create transaction and update balance atomically
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          name,
          value,
          type,
          date: date ? new Date(date) : new Date(),
          accountId,
          categoryId,
        },
        include: {
          category: {
            select: { id: true, name: true, color: true },
          },
          account: {
            select: { id: true, name: true },
          },
        },
      });

      // Update account balance
      const balanceChange = type === 'INCOME' ? value : -value;
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceChange } },
      });

      return transaction;
    });
  }

  async findAll(userId: string, filters?: { accountId?: string; categoryId?: string }) {
    // Build where clause based on user ownership
    const accounts = await this.prisma.account.findMany({
      where: {
        wallet: { userId },
      },
      select: { id: true },
    });

    const accountIds = accounts.map((a) => a.id);

    const where: Record<string, unknown> = {
      accountId: { in: accountIds },
    };

    if (filters?.accountId) {
      if (!accountIds.includes(filters.accountId)) {
        throw new SimpleErr('Conta não encontrada', HttpStatus.NOT_FOUND);
      }
      where.accountId = filters.accountId;
    }

    if (filters?.categoryId) {
      await this.categoriesService.validateOwnership(userId, filters.categoryId);
      where.categoryId = filters.categoryId;
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
        account: {
          select: {
            id: true,
            name: true,
            wallet: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
        account: {
          select: {
            id: true,
            name: true,
            wallet: {
              select: { id: true, name: true, color: true, userId: true },
            },
          },
        },
      },
    });

    if (!transaction || transaction.account.wallet.userId !== userId) {
      throw new SimpleErr('Transação não encontrada', HttpStatus.NOT_FOUND);
    }

    return transaction;
  }

  async update(userId: string, id: string, data: UpdateTransactionInput) {
    const parsed = UpdateTransactionSchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    const existingTransaction = await this.findOne(userId, id);

    const { name, value, type, date, categoryId } = parsed.data;

    // Validate category if provided
    if (categoryId) {
      await this.categoriesService.validateOwnership(userId, categoryId);
    }

    return this.prisma.$transaction(async (tx) => {
      // Revert old balance change
      const oldBalanceChange =
        existingTransaction.type === 'INCOME'
          ? -Number(existingTransaction.value)
          : Number(existingTransaction.value);

      await tx.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: { increment: oldBalanceChange } },
      });

      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          name,
          value,
          type,
          date: date ? new Date(date) : undefined,
          categoryId: categoryId === null ? null : categoryId,
        },
        include: {
          category: {
            select: { id: true, name: true, color: true },
          },
          account: {
            select: { id: true, name: true },
          },
        },
      });

      // Apply new balance change
      const newValue = value ?? Number(existingTransaction.value);
      const newType = type ?? existingTransaction.type;
      const newBalanceChange = newType === 'INCOME' ? newValue : -newValue;

      await tx.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: { increment: newBalanceChange } },
      });

      return updatedTransaction;
    });
  }

  async remove(userId: string, id: string) {
    const transaction = await this.findOne(userId, id);

    return this.prisma.$transaction(async (tx) => {
      // Revert balance change
      const balanceChange =
        transaction.type === 'INCOME'
          ? -Number(transaction.value)
          : Number(transaction.value);

      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceChange } },
      });

      await tx.transaction.delete({
        where: { id },
      });

      return { message: 'Transação excluída com sucesso' };
    });
  }

  async getSummary(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: {
        wallet: { userId },
      },
      select: { id: true, balance: true },
    });

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0
    );

    const accountIds = accounts.map((a) => a.id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        accountId: { in: accountIds },
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        value: true,
      },
    });

    const income = monthTransactions.find((t) => t.type === 'INCOME')?._sum.value || new Decimal(0);
    const expense = monthTransactions.find((t) => t.type === 'EXPENSE')?._sum.value || new Decimal(0);

    return {
      totalBalance,
      monthIncome: Number(income),
      monthExpense: Number(expense),
    };
  }
}
