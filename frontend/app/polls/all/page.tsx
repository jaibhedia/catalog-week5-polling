'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchAllPolls, voteOnPoll } from '@/lib/api';
import { useAppStore, Poll } from '@/lib/store';
import PollCard from '@/components/polls/PollCard';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AllPollsPage = () => {
  const router = useRouter();
  const { user } = useAppStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrating, setIsHydrating] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const joinedPollsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(() => {
      setIsHydrating(false);
    });
    setTimeout(() => setIsHydrating(false), 100);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isHydrating) return;

    if (!user) {
      console.log('User not logged in, redirecting to /login');
      router.push('/login');
      return;
    }

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL as string);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket for all polls');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Raw WebSocket data:', data); 
        const updatedPoll: Poll = {
          id: data._id?.$oid || data.id || '',
          title: data.title,
          options: data.options,
          isClosed: data.is_closed || false,
          author: data.author || 'Unknown', 
          _id: data._id || undefined,
        };
        if (!updatedPoll.id) {
          console.error('Received poll with no valid ID:', updatedPoll);
          return;
        }
        console.log('Received WebSocket update for poll:', updatedPoll);
        setPolls((prevPolls) => {
          const pollExists = prevPolls.some(p => p.id === updatedPoll.id);
          if (pollExists) {
            return prevPolls.map(p => (p.id === updatedPoll.id ? updatedPoll : p));
          } else {
            joinPoll(updatedPoll.id);
            return [...prevPolls, updatedPoll];
          }
        });
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (err: Event) => {
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
  }, [isHydrating, user, router]);

  useEffect(() => {
    if (isHydrating) return;

    const loadPolls = async () => {
      try {
        const allPolls = await fetchAllPolls();
        setPolls(allPolls);
        const storedVotedPolls = JSON.parse(sessionStorage.getItem('votedPolls') || '[]');
        setVotedPolls(storedVotedPolls);

        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          allPolls.forEach(poll => {
            joinPoll(poll.id);
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load polls.');
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, [isHydrating]);

  const joinPoll = (pollId: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && pollId && !joinedPollsRef.current.has(pollId)) {
      ws.send(`join_poll:${pollId}`);
      joinedPollsRef.current.add(pollId);
      console.log('Joined poll:', pollId);
    }
  };

  const validateSession = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, { withCredentials: true });
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleVote = async (pollId: string, optionId: number) => {
    if (!pollId || votedPolls.includes(pollId)) {
      console.error('Invalid poll ID or already voted:', pollId);
      return;
    }

    setError(null);

    const isSessionValid = await validateSession();
    if (!isSessionValid) {
      console.log('Invalid session detected, redirecting to /login');
      router.push('/login');
      return;
    }

    try {
      await voteOnPoll(pollId, optionId);
      const updatedPolls = polls.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              options: poll.options.map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
              ),
            }
          : poll
      );
      setPolls(updatedPolls);
      const newVotedPolls = [...votedPolls, pollId];
      setVotedPolls(newVotedPolls);
      sessionStorage.setItem('votedPolls', JSON.stringify(newVotedPolls));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote.');
      console.error('Vote error:', err);
    }
  };

  if (isHydrating || loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c0ecdc]">
      <div className="p-4 rounded-lg bg-[#e2f4f5] shadow-xl backdrop-blur-sm">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-[#e46494] rounded-full"></div>
          <div className="h-3 w-3 bg-[#e46494] rounded-full"></div>
          <div className="h-3 w-3 bg-[#e46494] rounded-full"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c0ecdc]">
      <div className="p-6 rounded-lg bg-[#e46494] border border-[#e46494] shadow-xl backdrop-blur-sm text-red-300">
        <span className="text-[#e46494] text-xl mr-2">⚠️</span>
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c0ecdc] via-[#c0ecdc] to-[#c8e6f5] overflow-hidden">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 mt-12">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#554b6a] via-[#554b6a] to-[#554b6a] bg-clip-text text-transparent text-center drop-shadow-lg">
          All Polls
        </h1>
        {polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 rounded-xl bg-[#e2f4f5] backdrop-blur-sm border border-[#e2f4f5] shadow-lg">
            <div className="text-[#554b6a] text-center text-lg">Nothing, it's empty.</div>
            <div className="mt-4 text-[#554b6a] text-sm">Come later.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                hasVoted={votedPolls.includes(poll.id) || poll.isClosed}
                onVote={(optionId) => handleVote(poll.id, optionId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPollsPage;