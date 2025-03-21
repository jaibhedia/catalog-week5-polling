'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api';
import { useAppStore } from '@/lib/store';

const Navbar = () => {
  const router = useRouter();
  const { user } = useAppStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="relative z-10 bg-gradient-to-r from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5] text-[#554b6a] p-4 shadow-md">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Polling App</div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="hover:text-white focus:outline-none"
          >
            Home
          </button>
          <button
            onClick={() => router.push('/polls/all')}
            className="hover:text-white focus:outline-none"
          >
            All Polls
          </button>
          {user ? (
            <>
              <button
                onClick={() => router.push('/polls/new')}
                className="hover:text-white focus:outline-none"
              >
                Create Poll
              </button>
              <button
                onClick={() => router.push('/polls/manage')}
                className="hover:text-white focus:outline-none"
              >
                Manage Polls
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="hover:text-[#554b6a]focus:outline-none"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#554b6a] text-white rounded-lg shadow-xl border border-white z-10 animate-slide-down">
                    <div className="p-4 border-b border-white">
                      <p className="text-sm font-semibold">{user.username}</p>
                      <p className="text-xs text-white">{user.id}</p>
                    </div>
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left p-3 hover:bg-gray-300 transition-colors duration-200"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left p-3 hover:bg-gray-300 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="hover:text-white focus:outline-none"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;