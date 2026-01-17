'use server';

import { fetchApi } from '../fetch';

export interface Category {
  id: string;
  name: string;
  color: string;
  parent: {
    id: string;
    name: string;
    color: string;
  } | null;
  children: {
    id: string;
    name: string;
    color: string;
  }[];
  _count: {
    transactions: number;
  };
}

export async function getCategories() {
  return fetchApi<Category[]>('/categories');
}

export async function getCategory(id: string) {
  return fetchApi<Category>(`/categories/${id}`);
}

export async function createCategory(data: {
  name: string;
  color?: string;
  parentId?: string;
}) {
  return fetchApi<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: string,
  data: { name?: string; color?: string; parentId?: string }
) {
  return fetchApi<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return fetchApi<{ message: string }>(`/categories/${id}`, {
    method: 'DELETE',
  });
}
