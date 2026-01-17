import { getToken } from './cookies';

export type ApiResponse<T> =
  | { data: T; errors: null; status: number }
  | { data: null; errors: string[]; status: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errors: string[] = [];

      if (data.details && Array.isArray(data.details)) {
        errors.push(...data.details);
      }

      if (data.fields && typeof data.fields === 'object') {
        for (const field in data.fields) {
          if (Array.isArray(data.fields[field])) {
            errors.push(...data.fields[field]);
          }
        }
      }

      if (errors.length === 0) {
        errors.push(data.message || 'Erro desconhecido');
      }

      return { data: null, errors, status: response.status };
    }

    return { data: data as T, errors: null, status: response.status };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      data: null,
      errors: ['Erro de conexao com o servidor'],
      status: 500,
    };
  }
}
