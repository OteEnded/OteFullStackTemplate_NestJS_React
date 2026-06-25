import { apiUrl } from './config';

const TOKEN_KEY = 'auth_token';

export type AuthUser = {
  uuid: string;
  rollingId: number;
  username: string;
  createdAt: string;
};

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

/** POST /api/auth/login — stores the JWT and returns the token + user. */
export const login = async (
  username: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> => {
  const response = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const result = await response.json();
  if (!response.ok || !result?.ok) {
    throw new Error(result?.message || 'Login failed');
  }
  setToken(result.data.accessToken);
  return { token: result.data.accessToken, user: result.data.user };
};

/** GET /api/auth/me — the protected route, using the stored Bearer token. */
export const fetchMe = async (): Promise<AuthUser> => {
  const token = getToken();
  if (!token) {
    throw new Error('Not logged in');
  }
  const response = await fetch(apiUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok || !result?.ok) {
    throw new Error(result?.message || 'Failed to load profile');
  }
  return result.data;
};
