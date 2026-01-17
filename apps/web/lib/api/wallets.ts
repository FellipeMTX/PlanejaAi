'use server';

import { fetchApi } from '../fetch';

export interface Wallet {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  accounts: {
    id: string;
    name: string;
    balance: string;
  }[];
}

export async function getWallets() {
  return fetchApi<Wallet[]>('/wallets');
}

export async function getWallet(id: string) {
  return fetchApi<Wallet>(`/wallets/${id}`);
}

export async function createWallet(data: { name: string; color?: string; icon?: string }) {
  return fetchApi<Wallet>('/wallets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWallet(
  id: string,
  data: { name?: string; color?: string; icon?: string }
) {
  return fetchApi<Wallet>(`/wallets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteWallet(id: string) {
  return fetchApi<{ message: string }>(`/wallets/${id}`, {
    method: 'DELETE',
  });
}
