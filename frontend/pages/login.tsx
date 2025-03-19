import { useState } from 'react';
import { useStore } from '../lib/store';
import { login } from '../lib/auth'; // Named import
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(username);
      setUser(user);
      router.push('/');
    } catch (err: any) {
      const message = err.message || 'An unexpected error occurred';
      setError(message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <button type="submit">Login with Passkey</button>
      </form>
    </div>
  );
}