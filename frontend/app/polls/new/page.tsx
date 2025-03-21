'use client';

import { useState, useEffect } from 'react';
import PollForm from '@/components/polls/PollForm';
import { createPoll } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import axios from 'axios';

const NewPollPage = () => {
  const router = useRouter();
  const { user } = useAppStore();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<{ id: number; text: string }[]>([
    { id: 1, text: '' },
    { id: 2, text: '' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(() => {
      setIsHydrating(false);
    });
    setTimeout(() => setIsHydrating(false), 100);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isHydrating && !user) {
      router.push('/login');
    }
  }, [user, router, isHydrating]);

  const validateSession = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, { withCredentials: true });
      return true;
    } catch (err) {
      console.error('Session validation failed:', err);
      return false;
    }
  };

  if (isHydrating) return <div className="text-center p-4">Loading...</div>;
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title.trim()) {
      setError('Poll title is required.');
      setLoading(false);
      return;
    }
    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      setError('At least two options are required.');
      setLoading(false);
      return;
    }

    const isSessionValid = await validateSession();
    if (!isSessionValid) {
      setError('Session expired or invalid. Please log in again.');
      router.push('/login');
      setLoading(false);
      return;
    }

    try {
      const pollData = {
        title,
        options: validOptions.map((opt) => opt.text),
      };
      const newPoll = await createPoll(pollData);
      console.log('Poll created successfully:', newPoll);
      setTitle('');
      setOptions([{ id: 1, text: '' }, { id: 2, text: '' }]);
      router.push(`/polls/${newPoll.id}`);
    } catch (err) {
      console.error('Error creating poll:', err);
      setError(err instanceof Error ? err.message : 'Failed to create poll.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5] text-gray-200">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 mt-8 bg-gradient-to-br from-[#e2f4f5] via-[#e2f4f5] to-[#e2f4f5] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.8)] border border-[#e2f4f5]">
        <h1 className="text-2xl font-semibold text-[#554b6a] mb-6 text-center tracking-wide">
          Create a New Poll
        </h1>
        
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        <div className="mb-6">
          <label className="block text-[#554b6a] text-sm mb-2">Poll Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter poll title..."
            className="w-full p-3 bg-gradient-to-br from-[#e2f4f5] via-[#e2f4f5] to-[#e2f4f5] text-[#554b6a] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e46494]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[#554b6a] text-sm mb-2">Options (At least 2 required)</label>
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index].text = e.target.value;
                  setOptions(newOptions);
                }}
                placeholder={`Option ${index + 1}`}
                className="w-full p-3 bg-gradient-to-br from-[#e2f4f5] via-[#e2f4f5] to-[#e2f4f5] text-[#554b6a] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e46494]"
              />
              {options.length > 2 && (
                <button
                  onClick={() => setOptions(options.filter((opt) => opt.id !== option.id))}
                  className="border border-[#e46494] text-[#e46494] p-2 rounded-md hover:bg-[#e46494] hover:text-white transition duration-200"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() =>
              setOptions([...options, { id: options.length + 1, text: '' }])
            }
            className="border border-[#e46494] text-[#e46494] py-2 px-4 rounded-md hover:bg-[#e46494] hover:text-white transition duration-200"
          >
            Add Option
          </button>

          <button
            onClick={handleSubmit}
            className={`border ${
              loading ? 'border-[gray-500] text-[#554b6a]' : 'border-[#e46494] text-[#e46494]'
            } py-2 px-4 rounded-md ${
              !loading && 'hover:bg-[#e46494] hover:text-[#554b6a] transition duration-200'
            }`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPollPage;