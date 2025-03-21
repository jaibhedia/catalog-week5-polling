import {
  startRegistration,
  startAuthentication,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

// Start Registration
export async function startRegister(username: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/register_start/${username}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Start register failed: ${response.status} - ${errorText}`);
    throw new Error('Failed to start registration');
  }
  const responseData = await response.json();
  const options: PublicKeyCredentialCreationOptionsJSON = responseData.publicKey;
  console.log('Register options (unwrapped):', JSON.stringify(options, null, 2));

  let credential: RegistrationResponseJSON;
  try {
    credential = await startRegistration({ optionsJSON: options });
    console.log('Generated credential:', JSON.stringify(credential, null, 2));
  } catch (error) {
    // Silently rethrow to avoid browser logging unhandled rejection
    throw error;
  }

  const finishResponse = await fetch(`${API_BASE_URL}/register_finish`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credential),
  });

  if (!finishResponse.ok) {
    const errorText = await finishResponse.text();
    console.error(`Finish register failed: ${finishResponse.status} - ${errorText}`);
    throw new Error('Failed to finish registration');
  }
  return await finishResponse.text();
}

// Start Authentication
export async function startAuth(username: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/login_start/${username}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Start auth failed: ${response.status} - ${errorText}`);
    throw new Error('Failed to start authentication');
  }
  const responseData = await response.json();
  const options: PublicKeyCredentialRequestOptionsJSON = responseData.publicKey;
  console.log('Auth options (unwrapped):', JSON.stringify(options, null, 2));

  let credential: AuthenticationResponseJSON;
  try {
    credential = await startAuthentication({ optionsJSON: options });
    console.log('Generated auth credential:', JSON.stringify(credential, null, 2));
  } catch (error) {
    // Silently rethrow to avoid browser logging unhandled rejection
    throw error;
  }

  const finishResponse = await fetch(`${API_BASE_URL}/login_finish`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credential),
  });

  if (!finishResponse.ok) {
    const errorText = await finishResponse.text();
    console.error(`Finish auth failed: ${finishResponse.status} - ${errorText}`);
    throw new Error('Failed to finish authentication');
  }
  return await finishResponse.text();
}