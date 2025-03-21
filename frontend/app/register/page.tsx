'use client';

import { useState } from 'react';
import { startRegister } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const RegisterPage = () => {
  const [username, setUsername] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await startRegister(username);
      setMessage('Registration successful! Please log in.');
      setTimeout(() => router.push('/login'), 1000);
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        setMessage('Registration cancelled. Please try again.');
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
          Register
        </h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full mt-6 p-3 rounded-md bg-[#f1fafb] text-[#554b6a] border border-[#f1fafb] focus:ring-2 focus:ring-[#e46494] focus:outline-none"
        />
        <button
          onClick={handleRegister}
          className="relative overflow-hidden bg-gradient-to-r from-[#e46494] to-[#e46494] text-white py-3 w-full rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 group font-medium mt-4"
        >
          <span className="relative z-10">Register</span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#e46494] to-[#e46494]0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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

export default RegisterPage;