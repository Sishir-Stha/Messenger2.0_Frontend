import { LogIn, MessageCircle } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { authSession } from '../authSession';
import { messagingService } from '../../messaging/services/messagingService';
import './auth.css';

interface LoginPageProps {
  onLogin: (userId: string) => void;
}

const demoUsers = [
  { id: 'user-current', name: 'You', username: 'sishirshrestha0', email: 'sishir@example.com' },
  { id: 'user-aanya', name: 'Aanya Sharma', username: 'aanya_sharma', email: 'aanya@example.com' },
  { id: 'user-bibek', name: 'Bibek K.C.', username: 'bibek_kc', email: 'bibek@example.com' },
  { id: 'user-maya', name: 'Maya Gurung', username: 'maya_gurung', email: 'maya@example.com' },
  { id: 'user-product', name: 'Product Team', username: 'product_team', email: 'product@example.com' },
];

const demoPassword = 'password123';

const resolveEmail = (value: string) => {
  const normalizedValue = value.trim().toLowerCase();
  const matchingUser = demoUsers.find(
    (user) =>
      user.id.toLowerCase() === normalizedValue ||
      user.username.toLowerCase() === normalizedValue ||
      user.name.toLowerCase() === normalizedValue ||
      user.email.toLowerCase() === normalizedValue,
  );

  return matchingUser?.email ?? value.trim();
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState(demoUsers[0].email);
  const [password, setPassword] = useState(demoPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDemoUser = useMemo(() => {
    const resolvedEmail = resolveEmail(email);
    return demoUsers.find((user) => user.email === resolvedEmail);
  }, [email]);

  const submitLogin = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const resolvedEmail = resolveEmail(email);

    if (!resolvedEmail || !password) {
      setError('Enter email and password.');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const user = await messagingService.login(resolvedEmail, password);
      authSession.setUserId(user.id);
      onLogin(user.id);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-hero" aria-label="Messenger login">
        <div className="login-brand">
          <span className="login-brand__mark" aria-hidden="true">
            <MessageCircle size={24} />
          </span>
          <span>Messenger</span>
        </div>

        <form className="login-form" onSubmit={(event) => void submitLogin(event)}>
          <div className="login-form__heading">
            <h1>Sign in</h1>
            <p>Use an email and password from a seeded account.</p>
          </div>

          <label className="login-field">
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              list="demo-login-users"
              autoComplete="email"
              placeholder="sishir@example.com"
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              value={password}
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="password123"
            />
          </label>

          <datalist id="demo-login-users">
            {demoUsers.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name}
              </option>
            ))}
          </datalist>

          {error ? <div className="login-error">{error}</div> : null}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            <LogIn size={18} aria-hidden="true" />
            <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>
      </section>

      <aside className="login-users" aria-label="Demo accounts">
        <div className="login-users__header">
          <h2>Accounts</h2>
        </div>
        <div className="login-users__list">
          {demoUsers.map((user) => (
            <button
              key={user.id}
              className="login-user"
              type="button"
              data-selected={selectedDemoUser?.id === user.id}
              onClick={() => {
                setEmail(user.email);
                setPassword(demoPassword);
              }}
            >
              <span className="login-user__avatar" aria-hidden="true">
                {user.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <span className="login-user__text">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </main>
  );
}
