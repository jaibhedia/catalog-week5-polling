import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { getToken, fetchWithAuth } from '../lib/auth';

function MyApp({ Component, pageProps }) {
    const { user, setUser } = useStore();

    useEffect(() => {
        const token = getToken();
        if (token && !user) {
            fetchWithAuth('http://127.0.0.1:8080/api/auth/me')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch user');
                    return res.json();
                })
                .then(data => setUser(data))
                .catch(() => localStorage.removeItem('token'));
        }
    }, [setUser, user]);

    return <Component {...pageProps} />;
}

export default MyApp;