// Where the JWT from POST /api/auth/login is kept. api.ts attaches it to every
// request as `Authorization: Bearer <token>`.
const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);
