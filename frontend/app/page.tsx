'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5] overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '12s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s'}}></div>
      </div>
      
      <Navbar />
      <div className="flex-grow flex items-center justify-center -mt-[150px]">  
        <div className={`max-w-4xl mx-auto p-6 text-center relative z-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
    <h1 className="text-5xl font-bold mb-6 animate-text bg-gradient-to-r from-[#554b6a] via-[#554b6a] to-[#554b6a] bg-clip-text text-transparent drop-shadow-lg">
            MatDaan 
          </h1>
          <p className={`text-xl text-black mb-10 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Vote Now
          </p>
          <div className={`space-x-6 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={() => router.push('/login')}
              className="relative overflow-hidden bg-gradient-to-r from-[#e46494] to-[#e46494] text-white py-3 px-8 rounded-lg hover:shadow-lg hover:shadow-[#e46494] transition-all duration-300 group font-medium"
            >
              <span className="relative z-10">Login</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#e46494] to-[#e46494] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute top-0 left-0 w-full h-0 bg-white/10 group-hover:h-full transition-all duration-300"></span>
            </button>
            <button
              onClick={() => router.push('/register')}
              className="relative overflow-hidden bg-gradient-to-r from-[#e46494] to-[#e46494] text-white py-3 px-8 rounded-lg hover:shadow-lg hover:shadow-[#e46494] transition-all duration-300 border border-[#e46494] group font-medium"
            >
              <span className="relative z-10">Register</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#e46494] to-[#e46494] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute top-0 left-0 w-full h-0 bg-white/10 group-hover:h-full transition-all duration-300"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
