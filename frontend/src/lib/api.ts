import { getAuth } from '@/auth/lib/helpers';

const API_URL = import.meta.env.VITE_API_URL as string;

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const auth = getAuth();
  const token = auth?.access_token;

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
