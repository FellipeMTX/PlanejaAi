'use server';

import { fetchApi } from '../fetch';
import { setToken, removeToken } from '../cookies';
import { redirect } from 'next/navigation';

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export async function signup(data: { name: string; email: string; password: string }) {
  const response = await fetchApi<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.data) {
    await setToken(response.data.token);
  }

  return response;
}

export async function login(data: { email: string; password: string }) {
  const response = await fetchApi<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.data) {
    await setToken(response.data.token);
  }

  return response;
}

export async function logout() {
  await removeToken();
  redirect('/auth/login');
}

export async function getMe() {
  return fetchApi<User>('/auth/me');
}
