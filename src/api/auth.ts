import { api, setToken, setSuppressAuthRedirect } from './client';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

export async function login(email: string, password: string): Promise<User> {
  setSuppressAuthRedirect(true);
  try {
    const data = await api.post<LoginResponse>('/auth/login', { email, password });
    setToken(data.access_token);
    return getMe();
  } finally {
    setSuppressAuthRedirect(false);
  }
}

export async function getMe(): Promise<User> {
  return api.get<User>('/auth/me');
}

export async function logout(): Promise<void> {
  setToken(null);
}
