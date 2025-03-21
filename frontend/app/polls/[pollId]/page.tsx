'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPoll } from '@/lib/api';
import { useAppStore, Poll } from '@/lib/store';
import Navbar from '@/components/Navbar';
import axios from 'axios';

const PollResultsPage = () => {
  const { pollId } = useParams();
  const { user, updatePoll, setUser } = useAppStore();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrating, setIsHydrating] = useState(true);
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(() => {
      setIsHydrating(false);
    });
    setTimeout(() => setIsHydrating(false), 100);
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, { withCredentials: true });
        setUser({ username: response.data.username, id: response.data.id });
        console.log('Session synced for user:', response.data.username);
      } catch (err) {
        console.error('Session check failed:', err);
        router.push('/login');
      }
    };
    if (!isHydrating && !user) {
      checkSession();
    }
  }, [isHydrating, user, router, setUser]);

  useEffect(() => {
    if (!isHydrating && !user) {
      router.push('/login');
    }
  }, [router, isHydrating, user]);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const pollData = await getPoll(pollId as string);
        setPoll(pollData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load poll results.');
      } finally {
        setLoading(false);
      }
    };
    if (!isHydrating && user) {
      fetchPoll();
    }
  }, [pollId, isHydrating, user]);
  useEffect(() => {
    if (isHydrating || !pollId || !user) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL as string);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`Connected to WebSocket for poll ${pollId} as user ${user.username}`);
      ws.send(`join_poll:${pollId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const updatedPoll: Poll = {
          ...data,
          id: data._id?.$oid || data.id || '',
          _id: data._id || undefined,
        };
        if (!updatedPoll.id) {
          console.error('Received poll with no valid ID:', updatedPoll);
          return;
        }
        if (updatedPoll.id === pollId) {
          console.log('Received WebSocket update for poll:', updatedPoll.id);
          setPoll(updatedPoll);
          updatePoll(updatedPoll);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      wsRef.current = null;
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [isHydrating, pollId, user, router, updatePoll]);

  if (isHydrating || loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!poll) return <div className="text-center p-4">Poll not found.</div>;

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c0ecdc] overflow-hidden relative">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 mt-12 bg-gradient-to-br from-[#e2f4f5] via-[#e2f4f5] to-[#e2f4f5] text-[#554b6a] rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#554b6a] via-[#554b6a] to-[#554b6a] bg-clip-text text-transparent">
          {poll.title} - Live Results
        </h1>
        <div className="space-y-4">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return (
              <div key={option.id} className="p-3 rounded-md border border-gray-700">
                <div className="flex justify-between mb-2">
                  <span>{option.text}</span>
                  <span>{option.votes} votes ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-[#e46494] to-[#e46494] h-4 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[#554b6a]">Total Votes: {totalVotes}</p>
        {poll.isClosed && <p className="text-[#554b6a] mt-2">This poll is closed.</p>}
      </div>
    </div>
  );
};

export default PollResultsPage;