import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { WalletsService } from '../wallets/wallets.service';
import { SimpleErr, FromZodErr } from '@/errors';
import {
  CreateAccountSchema,
  UpdateAccountSchema,
  CreateAccountInput,
  UpdateAccountInput,
} from '@repo/shared/request-dtos';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private walletsService: WalletsService
  ) {}

  async create(userId: string, walletId: string, data: CreateAccountInput) {
    const parsed = CreateAccountSchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    await this.walletsService.validateOwnership(userId, walletId);

    return this.prisma.account.create({
      data: {
        ...parsed.data,
        walletId,
      },
    });
  }

  async findAllByWallet(userId: string, walletId: string) {
    await this.walletsService.validateOwnership(userId, walletId);

    return this.prisma.account.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id },
      include: {
        wallet: {
          select: { userId: true },
        },
      },
    });

    if (!account || account.wallet.userId !== userId) {
      throw new SimpleErr('Conta não encontrada', HttpStatus.NOT_FOUND);
    }

    const { wallet: _, ...accountWithoutWallet } = account;
    return accountWithoutWallet;
  }

  async update(userId: string, id: string, data: UpdateAccountInput) {
    const parsed = UpdateAccountSchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    await this.findOne(userId, id);

    return this.prisma.account.update({
      where: { id },
      data: parsed.data,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.account.delete({
      where: { id },
    });

    return { message: 'Conta excluída com sucesso' };
  }

  async validateOwnership(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId },
      include: {
        wallet: {
          select: { userId: true },
        },
      },
    });

    if (!account || account.wallet.userId !== userId) {
      throw new SimpleErr('Conta não encontrada', HttpStatus.NOT_FOUND);
    }

    return account;
  }
}
