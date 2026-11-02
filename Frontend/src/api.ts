import { apiUrl } from './config';
import { getToken } from './token';

// The API contract: { ok: true, data } on success, { ok: false, message, code } on error
// (+ `details` on validation errors, + `request_id` on server errors). Same contract as the
// Fastify template v2. Branch on `err.code`, show `err.message`.
// The surface is GET + POST only (template rule, enforced by the backend at boot), so these
// two helpers are all a page needs. There is deliberately no put/patch/del helper.

export class ApiError extends Error {
  readonly status: number;
  /** Stable machine-readable code, e.g. 'invalid_request', 'not_found', 'not_signed_in'. */
  readonly code: string | undefined;
  /** Validation errors: [{ field, message }]. */
  readonly details: unknown;
  /** Server errors (5xx): quote this when reporting a problem; it is in the backend log. */
  readonly requestId: string | undefined;
  /** The whole error envelope (some errors carry `data`, e.g. /api/health's 503 db_down). */
  readonly body: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
    requestId?: string,
    body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.body = body;
  }
}

/** True for a request that was cancelled (component unmounted, newer request won). */
export function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

// 401 hook — e.g. clear the stored token and send the user to /login. Nothing is
// registered by default, so a 401 is just an ApiError with code 'not_signed_in'.
type UnauthorizedHandler = (err: ApiError) => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Register the 401 handler; returns an unregister function. */
export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

export type RequestOptions = {
  signal?: AbortSignal;
  /** Skip the 401 hook (e.g. the sign-in call itself). */
  skipAuthHook?: boolean;
};

type Envelope<T> = {
  ok?: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: unknown;
  request_id?: string;
};

async function request<T>(path: string, init: RequestInit, options: RequestOptions = {}): Promise<T> {
  // The backend is a separate origin (CORS) and auth is a Bearer JWT, not a cookie.
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...init, headers, signal: options.signal });
  } catch (err) {
    if (isAbort(err)) throw err;
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, 'network_error');
  }

  // A proxy or crash can answer with HTML/plain text — don't let JSON parsing
  // turn that into a cryptic "Unexpected token <" for the user.
  const result: Envelope<T> | null = await response.json().catch(() => null);

  if (!response.ok || !result?.ok) {
    const error = new ApiError(
      result?.message || `Request failed (${response.status})`,
      response.status,
      result?.code,
      result?.details,
      result?.request_id,
      result,
    );
    if (response.status === 401 && !options.skipAuthHook) unauthorizedHandler?.(error);
    throw error;
  }
  return result.data as T;
}

export function getJson<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { method: 'GET' }, options);
}

// Content-Type is set only when there is a body, so a body-less POST (e.g. an
// action like POST /x/:uuid/archive) is not declared as an empty JSON document.
export function postJson<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  const init: RequestInit = { method: 'POST' };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  return request<T>(path, init, options);
}

/** A readable one-liner for any error (ApiError, network, or a bug). */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.requestId) return `${err.message} (ref ${err.requestId})`;
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}
