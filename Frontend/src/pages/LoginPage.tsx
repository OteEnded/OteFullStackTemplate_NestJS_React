import { useEffect, useState } from 'react';
import { type AuthUser, clearToken, fetchMe, getToken, login } from '../auth';

/**
 * Example login page exercising the backend JWT auth module:
 * POST /api/auth/login then GET /api/auth/me (protected). Remove this page
 * (and src/auth.ts) along with the backend auth module if you don't need auth.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('changeme');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // If a token is already stored, show the current user.
  useEffect(() => {
    if (!getToken()) return;
    fetchMe()
      .then(setUser)
      .catch(() => clearToken());
  }, []);

  const onLogin = async () => {
    setBusy(true);
    setError('');
    try {
      const { user: loggedIn } = await login(username.trim(), password);
      setUser(loggedIn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setUser(null);
    } finally {
      setBusy(false);
    }
  };

  const onLogout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <section className="page-stack">
      <article className="panel">
        <p className="eyebrow">Example feature</p>
        <h2>Authentication</h2>
        <p className="muted-copy">
          Demonstrates the backend JWT module: log in to receive a token, then the
          protected <code>/api/auth/me</code> endpoint is called with it.
        </p>
      </article>

      {error ? <p className="message error">{error}</p> : null}

      {user ? (
        <article className="panel">
          <p className="eyebrow">Signed in</p>
          <h3>{user.username}</h3>
          <div className="status-card">
            <strong>Profile from /api/auth/me</strong>
            <span>uuid: {user.uuid}</span>
            <span>rollingId: {user.rollingId}</span>
            <span>created: {new Date(user.createdAt).toLocaleString()}</span>
          </div>
          <div className="button-row">
            <button className="secondary-btn" onClick={onLogout}>Log out</button>
          </div>
        </article>
      ) : (
        <article className="panel">
          <p className="eyebrow">Sign in</p>
          <h3>Log in</h3>
          <p className="muted-copy">Demo user is seeded by default: <strong>admin</strong> / <strong>changeme</strong>.</p>

          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>

          <div className="button-row">
            <button className="primary-btn" onClick={() => void onLogin()} disabled={busy}>
              {busy ? 'Signing in...' : 'Log in'}
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
