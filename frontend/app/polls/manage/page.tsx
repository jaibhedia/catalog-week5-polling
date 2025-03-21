'use client';

import { useState, useEffect } from 'react';
import { fetchUserPolls, closePoll, resetPoll, deletePoll, editPoll, logout } from '@/lib/api';
import { Poll, useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { TrashIcon, PencilSquareIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const PollManagePage = () => {
  const router = useRouter();
  const { user, polls, setPolls, setUser } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrating, setIsHydrating] = useState(true);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOptions, setEditOptions] = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(() => {
      setIsHydrating(false);
    });
    setTimeout(() => setIsHydrating(false), 100);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isHydrating && !user) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, { withCredentials: true });
          setUser({ username: response.data.username, id: response.data.id });
        } catch (err) {
          router.push('/login');
        }
      };
      fetchUser();
    }
  }, [user, router, setUser, isHydrating]);

  useEffect(() => {
    if (!isHydrating && !user) return;
    const loadPolls = async () => {
      try {
        const userPolls = await fetchUserPolls();
        setPolls(userPolls);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your polls.');
      } finally {
        setLoading(false);
      }
    };
    loadPolls();
  }, [user, router, setPolls, isHydrating]);

  const handleClosePoll = async (pollId: string) => {
    try {
      await closePoll(pollId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close poll.');
    }
  };

  const handleResetPoll = async (pollId: string) => {
    try {
      await resetPoll(pollId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset poll.');
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (confirm('Are you sure you want to delete this poll?')) {
      try {
        await deletePoll(pollId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete poll.');
      }
    }
  };

  const handleEditPoll = (poll: Poll) => {
    setEditingPoll(poll);
    setEditTitle(poll.title);
    setEditOptions(poll.options.map((opt) => ({ id: opt.id, text: opt.text })));
  };

  const handleSaveEdit = async () => {
    if (!editingPoll) return;
    try {
      const editedPoll = await editPoll(editingPoll.id, {
        title: editTitle,
        options: editOptions.map((opt) => opt.text),
      });
      setEditingPoll(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit poll.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout.');
    }
  };

  const handleOptionChange = (id: number, text: string) => {
    setEditOptions(editOptions.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const addOption = () => {
    const newId = editOptions.length ? editOptions[editOptions.length - 1].id + 1 : 1;
    setEditOptions([...editOptions, { id: newId, text: '' }]);
  };

  const removeOption = (id: number) => {
    if (editOptions.length > 2) {
      setEditOptions(editOptions.filter((opt) => opt.id !== id));
    }
  };

  if (isHydrating) return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5]"><div className="w-16 h-16 border-t-4 border-[#e46494] border-solid rounded-full animate-spin"></div></div>;
  if (!user) return null;
  if (loading) return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5]"><div className="w-16 h-16 border-t-4 border-[#e46494] border-solid rounded-full animate-spin"></div></div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5]"><div className="p-6 bg-[#e46494] border-2 border-[#e46494] rounded-lg shadow-lg shadow-[#e46494] text-white text-center">{error}</div></div>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 mt-8 bg-gradient-to-br from-[#e2f4f5] via-[#e2f4f5] to-[#e2f4f5] bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#554b6a] border-opacity-">
        <div className="flex items-center mb-8">
          <div className="w-2 h-8 bg-[#e2f4f5] rounded-full mr-3 shadow-lg shadow-[#e2f4f5]"></div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#554b6a] to-[#554b6a]">Manage Your Polls</h1>
        </div>
        {polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-gray-700 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400 text-xl font-light">You haven't created any polls yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="relative border border-gray-700 p-6 rounded-xl bg-gradient-to-br from-[#e2f4f5] via-[#e2f4f5] to-[#e2f4f5] bg-opacity-40 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#554b6a] hover:translate-y-[-5px] group"
              >
                {!poll.isClosed ? (
                  <div className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 bg-opacity-30 backdrop-blur-sm border border-green-500 text-xs font-bold uppercase rounded-full shadow-lg shadow-green-400">Active</div>
                ) : (
                  <div className="absolute -top-2 -right-2 px-3 py-1 bg-red-500 bg-opacity-30 backdrop-blur-sm border border-red-500 text-xs font-bold uppercase rounded-full shadow-lg shadow-red-500/20">Closed</div>
                )}
                
                <h2 className="text-xl font-bold mb-2 group-hover:text-[#e46494] transition-colors duration-300">{poll.title}</h2>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-900 to-transparent mb-4"></div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  {!poll.isClosed && (
                    <button
                      onClick={() => handleClosePoll(poll.id)}
                      title="Close Poll"
                      className="p-3 rounded-lg bg-transparent border border-[#e46494] shadow-lg transition-all duration-300 hover:shadow-[#e46494] hover:scale-110 relative overflow-hidden group/btn"
                    >
                      <span className="absolute inset-0 bg-[#e46494] opacity-20 group-hover/btn:opacity-30 transition-opacity duration-300"></span>
                      <span className="absolute inset-0 bg-[#e46494] opacity-0 group-hover/btn:opacity-10 group-hover/btn:blur-md transition-all duration-300"></span>
                      <XCircleIcon className="h-6 w-6 text-[#e46494] group-hover/btn:text-white relative z-10 transition-colors duration-300" />
                    </button>
                  )}
                  <button
                    onClick={() => handleResetPoll(poll.id)}
                    title="Reset Poll"
                    className="p-3 rounded-lg bg-transparent border border-[#e46494] shadow-lg transition-all duration-300 hover:shadow-[#e46494] hover:scale-110 relative overflow-hidden group/btn"
                  >
                    <span className="absolute inset-0 bg-[#e46494] opacity-20 group-hover/btn:opacity-30 transition-opacity duration-300"></span>
                    <span className="absolute inset-0 bg-[#e46494] opacity-0 group-hover/btn:opacity-10 group-hover/btn:blur-md transition-all duration-300"></span>
                    <ArrowPathIcon className="h-6 w-6 text-[#e46494] group-hover/btn:text-white relative z-10 transition-colors duration-300" />
                  </button>
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    title="Delete Poll"
                    className="p-3 rounded-lg bg-transparent border border-[#e46494] shadow-lg transition-all duration-300 hover:shadow-[#e46494] hover:scale-110 relative overflow-hidden group/btn"
                  >
                    <span className="absolute inset-0 bg-[#e46494] opacity-20 group-hover/btn:opacity-30 transition-opacity duration-300"></span>
                    <span className="absolute inset-0 bg-[#e46494] opacity-0 group-hover/btn:opacity-10 group-hover/btn:blur-md transition-all duration-300"></span>
                    <TrashIcon className="h-6 w-6 text-[#e46494] group-hover/btn:text-white relative z-10 transition-colors duration-300" />
                  </button>
                  <button
                    onClick={() => handleEditPoll(poll)}
                    title="Edit Poll"
                    className="p-3 rounded-lg bg-transparent border border-[#e46494] shadow-lg transition-all duration-300 hover:shadow-blue-[#e46494] hover:scale-110 relative overflow-hidden group/btn"
                  >
                    <span className="absolute inset-0 bg-[#e46494] opacity-20 group-hover/btn:opacity-30 transition-opacity duration-300"></span>
                    <span className="absolute inset-0 bg-[#e46494] opacity-0 group-hover/btn:opacity-10 group-hover/btn:blur-md transition-all duration-300"></span>
                    <PencilSquareIcon className="h-6 w-6 text-[#e46494] group-hover/btn:text-white relative z-10 transition-colors duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {editingPoll && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div onClick={e => e.stopPropagation()} className="bg-[#e2f4f5] bg-opacity-100 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#e2f4f5] transform transition-all duration-300 animate-scaleIn">
            <div className="flex items-center mb-6">
              {/* <div className="w-1 h-6 bg-blue-500 rounded-full mr-3 shadow-lg shadow-blue-500/50"></div> */}
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#554b6a] to-[#554b6a]">Edit Poll</h2>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#554b6a] mb-2">Poll Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter poll title"
                className="w-full p-3 border border-gray-600 bg-[#e2f4f5] bg-opacity-100 text-[#554b6a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e46494] focus:border-transparent transition-all duration-300 shadow-inner"
              />
            </div>
            
            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-[#554b6a] `mb-2">Poll Options</label>
              {editOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    placeholder="Enter option text"
                    className="w-full p-3 border border-gray-600 bg-[#e2f4f5] bg-opacity-100 text-[#554b6a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e46494] focus:border-transparent transition-all duration-300 shadow-inner"
                  />
                  {editOptions.length > 2 && (
                    <button
                      onClick={() => removeOption(option.id)}
                      title="Remove this option"
                      className="p-3 rounded-lg bg-transparent border border-[#e46494] shadow-lg transition-all duration-300 hover:shadow-[#e46494] hover:scale-110 relative overflow-hidden group/btn"
                    >
                      <span className="absolute inset-0 bg-[#e46494] opacity-20 group-hover/btn:opacity-30 transition-opacity duration-300"></span>
                      <span className="absolute inset-0 bg-[#e46494]0 opacity-0 group-hover/btn:opacity-10 group-hover/btn:blur-md transition-all duration-300"></span>
                      <TrashIcon className="h-6 w-6 text-[#e46494] group-hover/btn:text-white relative z-10 transition-colors duration-300" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addOption}
                title="Add a new poll option"
                className="text-[#e46494] hover:text-[#e46494] mb-4"
              >
                + Add Option
              </button>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setEditingPoll(null)}
                className="px-6 py-3 rounded-lg bg-transparent border border-gray-500 text-white shadow-lg transition-all duration-300 hover:shadow-gray-500/30 hover:scale-105 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gray-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></span>
                <span className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-10 group-hover:blur-md transition-all duration-300"></span>
                <span className="relative z-10">Cancel</span>
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-3 rounded-lg bg-transparent border border-[#e46494] text-white shadow-lg transition-all duration-300 hover:shadow-[#e46494] hover:scale-105 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-[#e46494] opacity-20 group-hover:opacity-30 transition-opacity duration-300"></span>
                <span className="absolute inset-0 bg-[#e46494] opacity-0 group-hover:opacity-10 group-hover:blur-md transition-all duration-300"></span>
                <span className="relative z-10">Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollManagePage;