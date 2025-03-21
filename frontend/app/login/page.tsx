'use client';
import { useState } from 'react';
import { startAuth } from '@/lib/auth';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';

const LoginPage = () => {
  const [username, setUsername] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const { setUser } = useAppStore();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await startAuth(username);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, { withCredentials: true });
      const userData = response.data;
      setUser({ username: userData.username, id: userData.id });
      console.log('User set in store:', useAppStore.getState().user);
      setMessage('Authentication successful!');
      const intendedPath = document.referrer.includes('/polls/manage') ? '/polls/manage' : '/polls/new';
      router.push(intendedPath);
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        setMessage('Authentication cancelled. Please try again.');
      } else {
        setMessage(`Error: ${(error as Error).message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5] text-gray-100 flex flex-col items-center">
      <div className="w-full">
        <Navbar />
      </div>
      <div className="max-w-md w-full mt-16 p-6 bg-[#e2f4f5] rounded-lg shadow-lg text-center border border-[#e2f4f5]">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#554b6a] via-[#554b6a] to-[#554b6a] bg-clip-text text-transparent">
          Login
        </h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full mt-6 p-3 rounded-md bg-[#f1fafb] text-[#554b6a] border border-[#f1fafb] focus:ring-2 focus:ring-[#e46494] focus:outline-none"
        />
        <button
          onClick={handleLogin}
          className="relative overflow-hidden bg-gradient-to-r from-[#e46494] to-[#e46494] text-white py-3 w-full rounded-lg hover:shadow-lg hover:shadow-[#e46494] transition-all duration-300 group font-medium mt-4"
        >
          <span className="relative z-10">Login</span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#e46494] to-[#e46494] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="absolute top-0 left-0 w-full h-0 bg-white/10 group-hover:h-full transition-all duration-300"></span>
        </button>
        {message && (
          <p className={`mt-4 text-sm ${message.includes('Error') || message.includes('cancelled') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;