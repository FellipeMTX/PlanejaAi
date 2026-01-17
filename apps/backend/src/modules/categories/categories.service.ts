import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { SimpleErr, FromZodErr } from '@/errors';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@repo/shared/request-dtos';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateCategoryInput) {
    const parsed = CreateCategorySchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    const { name, color, parentId } = parsed.data;

    // Check for duplicate name
    const existing = await this.prisma.category.findUnique({
      where: { userId_name: { userId, name } },
    });

    if (existing) {
      throw new SimpleErr('Já existe uma categoria com este nome', HttpStatus.CONFLICT);
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: parentId, userId },
      });

      if (!parent) {
        throw new SimpleErr('Categoria pai não encontrada', HttpStatus.NOT_FOUND);
      }
    }

    return this.prisma.category.create({
      data: {
        name,
        color,
        parentId,
        userId,
      },
      include: {
        parent: {
          select: { id: true, name: true, color: true },
        },
        children: {
          select: { id: true, name: true, color: true },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      include: {
        parent: {
          select: { id: true, name: true, color: true },
        },
        children: {
          select: { id: true, name: true, color: true },
        },
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      include: {
        parent: {
          select: { id: true, name: true, color: true },
        },
        children: {
          select: { id: true, name: true, color: true },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!category) {
      throw new SimpleErr('Categoria não encontrada', HttpStatus.NOT_FOUND);
    }

    return category;
  }

  async update(userId: string, id: string, data: UpdateCategoryInput) {
    const parsed = UpdateCategorySchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    await this.findOne(userId, id);

    const { name, parentId } = parsed.data;

    // Check for duplicate name if name is being changed
    if (name) {
      const existing = await this.prisma.category.findFirst({
        where: { userId, name, NOT: { id } },
      });

      if (existing) {
        throw new SimpleErr('Já existe uma categoria com este nome', HttpStatus.CONFLICT);
      }
    }

    // Validate parent if provided
    if (parentId) {
      if (parentId === id) {
        throw new SimpleErr('Uma categoria não pode ser pai de si mesma', HttpStatus.BAD_REQUEST);
      }

      const parent = await this.prisma.category.findFirst({
        where: { id: parentId, userId },
      });

      if (!parent) {
        throw new SimpleErr('Categoria pai não encontrada', HttpStatus.NOT_FOUND);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: parsed.data,
      include: {
        parent: {
          select: { id: true, name: true, color: true },
        },
        children: {
          select: { id: true, name: true, color: true },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    const category = await this.findOne(userId, id);

    if (category._count.transactions > 0) {
      throw new SimpleErr(
        `Esta categoria possui ${category._count.transactions} transação(ões) associada(s). Remova ou reclassifique as transações antes de excluir.`,
        HttpStatus.CONFLICT
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Categoria excluída com sucesso' };
  }

  async validateOwnership(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      throw new SimpleErr('Categoria não encontrada', HttpStatus.NOT_FOUND);
    }

    return category;
  }
}
