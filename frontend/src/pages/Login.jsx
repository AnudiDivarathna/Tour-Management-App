import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../auth';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const signedIn = await signIn(username, password);
      navigate(signedIn.role === 'admin' ? '/' : '/driver', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="home-gate gate-login">
      <div className="home-card">
        <BrandMark size="lg" />
        <p className="muted gate-lead">Sign in to continue.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}

          <label className="login-field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              autoComplete="username"
              autoCapitalize="none"
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="btn primary login-submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
