import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { SimpleErr, FromZodErr } from '@/errors';
import {
  CreateWalletSchema,
  UpdateWalletSchema,
  CreateWalletInput,
  UpdateWalletInput,
} from '@repo/shared/request-dtos';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateWalletInput) {
    const parsed = CreateWalletSchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    return this.prisma.wallet.create({
      data: {
        ...parsed.data,
        userId,
      },
      include: {
        accounts: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId },
      include: {
        accounts: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
      include: {
        accounts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wallet) {
      throw new SimpleErr('Carteira não encontrada', HttpStatus.NOT_FOUND);
    }

    return wallet;
  }

  async update(userId: string, id: string, data: UpdateWalletInput) {
    const parsed = UpdateWalletSchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    await this.findOne(userId, id);

    return this.prisma.wallet.update({
      where: { id },
      data: parsed.data,
      include: {
        accounts: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.wallet.delete({
      where: { id },
    });

    return { message: 'Carteira excluída com sucesso' };
  }

  async validateOwnership(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new SimpleErr('Carteira não encontrada', HttpStatus.NOT_FOUND);
    }

    return wallet;
  }
}
