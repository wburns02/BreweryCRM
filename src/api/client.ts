const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

let authToken: string | null = localStorage.getItem('bh_token');
let suppressAuthRedirect = false;

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('bh_token', token);
  else localStorage.removeItem('bh_token');
}

export function getToken() {
  return authToken;
}

export function setSuppressAuthRedirect(suppress: boolean) {
  suppressAuthRedirect = suppress;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    if (!suppressAuthRedirect) {
      window.location.reload();
    }
    throw new Error('Unauthorized');
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
