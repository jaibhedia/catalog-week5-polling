import { useState } from 'react';
import { useStore } from '../lib/store';
import { register } from '../lib/auth';
import { useRouter } from 'next/router';

export default function Register() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { setUser } = useStore();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const user = await register(username);
            setUser(user);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div>
            <h1>Register</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <button type="submit">Register with Passkey</button>
            </form>
        </div>
    );
}