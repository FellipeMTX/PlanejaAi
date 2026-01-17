'use server';

import { fetchApi } from '../fetch';

export interface Transaction {
  id: string;
  name: string;
  value: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  account: {
    id: string;
    name: string;
    wallet: {
      id: string;
      name: string;
      color: string;
    };
  };
}

export interface TransactionSummary {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
}

export async function getTransactions(filters?: { accountId?: string; categoryId?: string }) {
  const params = new URLSearchParams();
  if (filters?.accountId) params.set('accountId', filters.accountId);
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);

  const query = params.toString();
  return fetchApi<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
}

export async function getTransactionSummary() {
  return fetchApi<TransactionSummary>('/transactions/summary');
}

export async function getTransaction(id: string) {
  return fetchApi<Transaction>(`/transactions/${id}`);
}

export async function createTransaction(data: {
  name: string;
  value: number;
  type: 'INCOME' | 'EXPENSE';
  date?: string;
  accountId: string;
  categoryId?: string;
}) {
  return fetchApi<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(
  id: string,
  data: {
    name?: string;
    value?: number;
    type?: 'INCOME' | 'EXPENSE';
    date?: string;
    categoryId?: string | null;
  }
) {
  return fetchApi<Transaction>(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: string) {
  return fetchApi<{ message: string }>(`/transactions/${id}`, {
    method: 'DELETE',
  });
}
