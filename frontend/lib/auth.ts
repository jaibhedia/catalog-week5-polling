// frontend/lib/auth.ts
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

const API_URL = 'http://127.0.0.1:8080';

export async function register(username: string) {
  try {
    const optionsResp = await fetch(`${API_URL}/api/auth/register-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const optionsData = await optionsResp.json();
    console.log('Options response:', optionsData);

    if (!optionsResp.ok) {
      const errorMsg = optionsData.error ? String(optionsData.error) : 'Failed to get registration options';
      throw new Error(errorMsg);
    }

    const { challenge, user_id } = optionsData;
    if (!challenge || !user_id) {
      throw new Error('Invalid registration options: missing challenge or user_id');
    }

    const publicKey = {
      ...challenge.publicKey,
      challenge: challenge.publicKey.challenge,
      user: {
        ...challenge.publicKey.user,
        id: Uint8Array.from(atob(challenge.publicKey.user.id), c => c.charCodeAt(0)),
      },
    };

    console.log('Starting WebAuthn registration with publicKey:', publicKey);
    let credential;
    try {
      credential = await startRegistration(publicKey);
    } catch (webauthnError) {
      console.error('WebAuthn registration failed:', webauthnError);
      throw new Error(`WebAuthn error: ${webauthnError.message || webauthnError}`);
    }
    console.log('Credential created:', credential);

    console.log('Sending verification request with:', { username, user_id, credential });
    const verifyResp = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, user_id, credential }),
    });
    const verifyData = await verifyResp.json();
    console.log('Verify response:', verifyData);

    if (!verifyResp.ok) {
      const errorMsg = verifyData.error ? String(verifyData.error) : 'Registration failed';
      throw new Error(errorMsg);
    }

    if (!verifyData.token || !verifyData.user) {
      throw new Error('Invalid registration response: missing token or user');
    }

    localStorage.setItem('token', verifyData.token);
    return verifyData.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function login(username: string) {
  try {
    const optionsResp = await fetch(`${API_URL}/api/auth/login-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const options = await optionsResp.json();
    console.log('Login options response:', options);

    if (!optionsResp.ok) {
      const errorMsg = options.error ? String(options.error) : 'Failed to get login options';
      throw new Error(errorMsg);
    }

    const credential = await startAuthentication(options);
    console.log('Login credential:', credential);

    const verifyResp = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, credential }),
    });
    const data = await verifyResp.json();
    console.log('Login verify response:', data);

    if (!verifyResp.ok) {
      const errorMsg = data.error ? String(data.error) : 'Login failed';
      throw new Error(errorMsg);
    }

    localStorage.setItem('token', data.token);
    return data.user;
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