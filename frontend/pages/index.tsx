import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';

export default function Home() {
    const { user } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>Home</h1>
            {user ? (
                <p>Welcome, {user.username}!</p>
            ) : (
                <p>Please log in or register.</p>
            )}
        </div>
    );
}