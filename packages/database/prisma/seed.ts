import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@planeja.ai' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'demo@planeja.ai',
      password: hashedPassword,
    },
  });

  console.log('Created demo user:', user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Alimentacao' } },
      update: {},
      create: { name: 'Alimentacao', color: '#EF4444', userId: user.id },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Transporte' } },
      update: {},
      create: { name: 'Transporte', color: '#3B82F6', userId: user.id },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Moradia' } },
      update: {},
      create: { name: 'Moradia', color: '#8B5CF6', userId: user.id },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Lazer' } },
      update: {},
      create: { name: 'Lazer', color: '#10B981', userId: user.id },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Salario' } },
      update: {},
      create: { name: 'Salario', color: '#22C55E', userId: user.id },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Investimentos' } },
      update: {},
      create: { name: 'Investimentos', color: '#F59E0B', userId: user.id },
    }),
  ]);

  console.log('Created categories:', categories.length);

  // Create wallets
  const nubank = await prisma.wallet.upsert({
    where: { id: 'demo-nubank-wallet' },
    update: {},
    create: {
      id: 'demo-nubank-wallet',
      name: 'Nubank',
      color: '#8B5CF6',
      userId: user.id,
    },
  });

  const itau = await prisma.wallet.upsert({
    where: { id: 'demo-itau-wallet' },
    update: {},
    create: {
      id: 'demo-itau-wallet',
      name: 'Itau',
      color: '#F97316',
      userId: user.id,
    },
  });

  console.log('Created wallets: Nubank, Itau');

  // Create accounts
  const nubankAccount = await prisma.account.upsert({
    where: { id: 'demo-nubank-account' },
    update: {},
    create: {
      id: 'demo-nubank-account',
      name: 'Conta Corrente',
      balance: 5000,
      walletId: nubank.id,
    },
  });

  const itauAccount = await prisma.account.upsert({
    where: { id: 'demo-itau-account' },
    update: {},
    create: {
      id: 'demo-itau-account',
      name: 'Conta Corrente',
      balance: 2500,
      walletId: itau.id,
    },
  });

  console.log('Created accounts with balances');

  // Create sample transactions
  const now = new Date();
  const transactions = [
    {
      name: 'Salario Janeiro',
      value: 8000,
      type: 'INCOME' as const,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      accountId: nubankAccount.id,
      categoryId: categories[4]!.id, // Salario
    },
    {
      name: 'Aluguel',
      value: 1500,
      type: 'EXPENSE' as const,
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      accountId: nubankAccount.id,
      categoryId: categories[2]!.id, // Moradia
    },
    {
      name: 'Supermercado',
      value: 450,
      type: 'EXPENSE' as const,
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      accountId: nubankAccount.id,
      categoryId: categories[0]!.id, // Alimentacao
    },
    {
      name: 'Uber',
      value: 85,
      type: 'EXPENSE' as const,
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      accountId: nubankAccount.id,
      categoryId: categories[1]!.id, // Transporte
    },
    {
      name: 'Cinema',
      value: 60,
      type: 'EXPENSE' as const,
      date: new Date(now.getFullYear(), now.getMonth(), 18),
      accountId: itauAccount.id,
      categoryId: categories[3]!.id, // Lazer
    },
    {
      name: 'Restaurante',
      value: 120,
      type: 'EXPENSE' as const,
      date: new Date(now.getFullYear(), now.getMonth(), 20),
      accountId: itauAccount.id,
      categoryId: categories[0]!.id, // Alimentacao
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }

  console.log('Created sample transactions:', transactions.length);

  console.log('\n--- SEED COMPLETE ---');
  console.log('Demo user credentials:');
  console.log('  Email: demo@planeja.ai');
  console.log('  Password: demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
