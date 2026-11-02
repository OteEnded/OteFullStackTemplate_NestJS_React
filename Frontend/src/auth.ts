import { getJson, postJson } from './api';
import { clearToken, getToken, setToken } from './token';

export { clearToken, getToken, setToken };

export type AuthUser = {
  uuid: string;
  rollingId: number;
  username: string;
  createdAt: string;
};

/**
 * POST /api/auth/login — stores the JWT and returns the token + user.
 * Wrong username/password -> ApiError with code 'invalid_credentials'.
 */
export const login = async (
  username: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> => {
  const data = await postJson<{ accessToken: string; user: AuthUser }>(
    '/api/auth/login',
    { username, password },
    { skipAuthHook: true },
  );
  setToken(data.accessToken);
  return { token: data.accessToken, user: data.user };
};

/** GET /api/auth/me — the protected route (api.ts sends the stored Bearer token). */
export const fetchMe = (): Promise<AuthUser> => getJson<AuthUser>('/api/auth/me');
