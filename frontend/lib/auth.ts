import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

const API_URL = 'http://127.0.0.1:8080';

export async function register(username: string) {
    try {
        // Step 1: Fetch registration options
        const initResp = await fetch(`${API_URL}/api/reg/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        const initData = await initResp.json();
        if (!initResp.ok) throw new Error(initData.error || 'Failed to init registration');

        // Log and validate response
        console.log('Registration init response:', JSON.stringify(initData, null, 2));
        if (!initData.challenge || !initData.challenge.publicKey || !initData.challenge.publicKey.challenge) {
            throw new Error('Invalid registration options: missing challenge data');
        }
        if (!initData.user_id) {
            throw new Error('Missing user_id in response');
        }

        // Step 2: Generate passkey
        const options = initData.challenge; // Already includes publicKey
        console.log('Options for startRegistration:', JSON.stringify(options, null, 2));
        const credential = await startRegistration(options);

        // Step 3: Complete registration
        const completeResp = await fetch(`${API_URL}/api/reg/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: initData.user_id, credential }),
        });
        const completeData = await completeResp.json();
        if (!completeResp.ok) throw new Error(completeData.error || 'Registration failed');

        localStorage.setItem('token', completeData.token);
        return completeData.user;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
}

export async function login(username: string) {
    try {
        // Step 1: Fetch authentication options
        const startResp = await fetch(`${API_URL}/api/auth/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        const startData = await startResp.json();
        if (!startResp.ok) throw new Error(startData.error || 'Failed to start authentication');

        // Log and validate response
        console.log('Authentication start response:', JSON.stringify(startData, null, 2));
        if (!startData.challenge || !startData.allowCredentials) {
            throw new Error('Invalid authentication options: missing challenge or allowCredentials');
        }

        // Step 2: Authenticate with passkey
        const options = startData; // Directly use the response
        console.log('Options for startAuthentication:', JSON.stringify(options, null, 2));
        const credential = await startAuthentication(options);

        // Step 3: Complete authentication
        const completeResp = await fetch(`${API_URL}/api/auth/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, credential }),
        });
        const completeData = await completeResp.json();
        if (!completeResp.ok) throw new Error(completeData.error || 'Login failed');

        localStorage.setItem('token', completeData.token);
        return completeData.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export function getToken() {
    return localStorage.getItem('token');
}

export function logout() {
    localStorage.removeItem('token');
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getToken();
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
    return fetch(url, { ...options, headers });
}