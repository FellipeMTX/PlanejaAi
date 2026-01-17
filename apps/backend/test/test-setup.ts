import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/shared/services/prisma.service';
import * as bcrypt from 'bcrypt';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}

export class TestDatabaseManager {
  constructor(private prisma: PrismaService) {}

  async createTestUser(data?: { email?: string; password?: string }) {
    const email = data?.email || `test-${Date.now()}@test.com`;
    const password = data?.password || 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        name: 'Test User',
        email,
        password: hashedPassword,
      },
    });
  }

  async cleanup() {
    await this.prisma.transaction.deleteMany();
    await this.prisma.category.deleteMany();
    await this.prisma.account.deleteMany();
    await this.prisma.wallet.deleteMany();
    await this.prisma.user.deleteMany();
  }
}
