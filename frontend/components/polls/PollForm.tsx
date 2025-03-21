'use client';

import { useCallback } from 'react';

interface PollOption {
  id: number;
  text: string;
}

interface PollFormProps {
  title: string;
  setTitle: (title: string) => void;
  options: PollOption[];
  setOptions: (options: PollOption[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const PollForm = ({ title, setTitle, options, setOptions, onSubmit, loading }: PollFormProps) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleOptionChange = (id: number, text: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  };

  const addOption = useCallback(() => {
    const newId = options.length ? options[options.length - 1].id + 1 : 1;
    setOptions([...options, { id: newId, text: '' }]);
  }, [options, setOptions]);

  const removeOption = (id: number) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Poll Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter your poll question"
          className="mt-1 block w-full border border-[#e2f4f5] rounded-md p-2"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options (at least 2 required)
        </label>
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(option.id, e.target.value)}
              placeholder={`Option ${option.id}`}
              className="block w-full border border-[#e2f4f5] rounded-md p-2"
              disabled={loading}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="text-[#e46494] hover:text-[#e46494]"
                disabled={loading}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="text-[#e46494]0 hover:text-[#e46494] mt-2"
          disabled={loading}
        >
          + Add Option
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-[#e46494] text-white py-2 px-4 rounded-md hover:bg-[#e46494] disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Poll'}
      </button>
    </form>
  );
};

export default PollForm;