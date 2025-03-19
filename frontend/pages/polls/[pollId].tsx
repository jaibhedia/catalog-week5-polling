import { useEffect, useState } from 'react';
import { useStore, fetchWithAuth } from '../../lib/store';
import { useRouter } from 'next/router';

export default function PollPage() {
  const router = useRouter();
  const { pollId } = router.query;
  const { user, polls, updatePoll } = useStore();
  const [pollData, setPollData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (pollId) {
      fetchWithAuth(`http://127.0.0.1:8080/api/polls/${pollId}/results`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setPollData(data);
          updatePoll(data.poll);
        })
        .catch((err) => setError(err.message));

      const websocket = new WebSocket(`ws://127.0.0.1:8080/ws/polls/${pollId}`);
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) setError(data.error);
        else {
          setPollData(data);
          updatePoll(data.poll);
        }
      };
      setWs(websocket);

      return () => websocket.close();
    }
  }, [pollId, updatePoll]);

  const handleVote = async (optionId: string) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/api/polls/${pollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ id: optionId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Voting failed');
      updatePoll(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = async () => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/api/polls/${pollId}/close`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to close poll');
      updatePoll(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8080/api/polls/${pollId}/reset`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset poll');
      updatePoll(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!pollData) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{pollData.poll.title}</h1>
      <div>
        {pollData.poll.options.map((option: any) => (
          <div key={option.id}>
            <button onClick={() => handleVote(option.id)} disabled={pollData.poll.is_closed}>
              {option.text} ({option.votes} votes - {pollData.percentages[option.id]}%)
            </button>
          </div>
        ))}
      </div>
      <p>Total Votes: {pollData.total_votes}</p>
      {user?.id === pollData.poll.creator_id && (
        <>
          <button onClick={handleClose} disabled={pollData.poll.is_closed}>
            Close Poll
          </button>
          <button onClick={handleReset}>Reset Votes</button>
        </>
      )}
    </div>
  );
}