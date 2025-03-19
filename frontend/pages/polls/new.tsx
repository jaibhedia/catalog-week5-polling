import { useState } from 'react';
import { useStore } from '../../lib/store';
import { useRouter } from 'next/router';
import { fetchWithAuth } from '../../lib/store';

export default function NewPoll() {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState<string | null>(null);
  const { user, addPoll } = useStore();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('Poll must have at least 2 options');
      return;
    }

    try {
      const response = await fetchWithAuth('http://127.0.0.1:8080/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          title,
          options: validOptions.map((text) => ({ text })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create poll');
      addPoll(data);
      router.push(`/polls/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <h1>Create New Poll</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Poll Title"
      />
      {options.map((opt, i) => (
        <input
          key={i}
          type="text"
          value={opt}
          onChange={(e) => {
            const newOptions = [...options];
            newOptions[i] = e.target.value;
            setOptions(newOptions);
          }}
          placeholder={`Option ${i + 1}`}
        />
      ))}
      <button type="button" onClick={() => setOptions([...options, ''])}>
        Add Option
      </button>
      <button type="submit">Create Poll</button>
    </form>
  );
}