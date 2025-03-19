import { useEffect, useState } from 'react';
import { getToken } from '../lib/auth'; // Named import
import { useStore } from '../lib/store';

console.log('Imported getToken:', getToken); // Debug import

export default function Home() {
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('getToken inside useEffect:', getToken); // Debug again
    const token = getToken();
    console.log('Token:', token);
    if (token && !user) {
      setUser({ id: 'temp', username: 'temp' });
      console.log('User set to:', { id: 'temp', username: 'temp' });
    } else {
      console.log('No token or user already set');
    }
    setLoading(false);
  }, [setUser, user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  console.log('Rendering with user:', user);

  return (
    <div>
      <h1>Home</h1>
      {user ? (
        <p>Welcome, {user.username || 'Unknown'}!</p>
      ) : (
        <p>Please log in or register.</p>
      )}
    </div>
  );
}