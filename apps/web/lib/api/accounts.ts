'use server';

import { fetchApi } from '../fetch';

export interface Account {
  id: string;
  name: string;
  balance: string;
  walletId: string;
}

export async function getAccountsByWallet(walletId: string) {
  return fetchApi<Account[]>(`/wallets/${walletId}/accounts`);
}

export async function getAccount(id: string) {
  return fetchApi<Account>(`/accounts/${id}`);
}

export async function createAccount(walletId: string, data: { name: string; balance?: number }) {
  return fetchApi<Account>(`/wallets/${walletId}/accounts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAccount(id: string, data: { name?: string }) {
  return fetchApi<Account>(`/accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(id: string) {
  return fetchApi<{ message: string }>(`/accounts/${id}`, {
    method: 'DELETE',
  });
}
