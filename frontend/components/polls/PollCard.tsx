'use client';

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: String;
  title: string;
  options: PollOption[];
  isClosed: boolean;
  author: string; // Added author field
}

interface PollCardProps {
  poll: Poll;
  hasVoted: boolean;
  onVote: (optionId: number) => void;
}

const PollCard = ({ poll, hasVoted, onVote }: PollCardProps) => {
  console.log('PollCard poll:', poll);
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div
      className={`bg-gradient-to-br from-[#e2f4f5] via-[#e2f4f5] to-[#e2f4f5]  border border-gray-700 rounded-xl p-5 shadow-lg transition-all duration-300 relative ${
        poll.isClosed
          ? 'opacity-50 grayscale hover:opacity-75 hover:grayscale-0'
          : 'hover:border-[#e46494] hover:shadow-xl hover:shadow-cyan-900/20'
      }`}
    >
      {poll.isClosed && (
        <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
          Closed
        </div>
      )}
      <h2 className="text-lg font-bold text-[#554b6a] mt-5 mb-2 drop-shadow-md">{poll.title}</h2>
      <p className="text-sm text-[#554b6a] mb-4">Created by {poll.author}</p>
      <div className="space-y-5">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <div key={option.id} className="relative">
              <div className="flex justify-between items-center text-gray-300 mb-2">
                <span className="text-[#554b6a]">{option.text}</span>
                <span className="text-[#554b6a] text-sm">{option.votes} votes ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#e46494] to-[#e46494] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {!hasVoted && !poll.isClosed && (
                  <div className="relative group">
                    <button
                      onClick={() => onVote(option.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-[#e46494] to-[#e46494] text-white shadow-lg hover:shadow-[#e46494] transition-all duration-300 hover:scale-105"
                      aria-label="Vote for this option"
                    >
                      <span>✓</span>
                    </button>
                    <div className="absolute opacity-0 group-hover:opacity-100 -top-8 right-0 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg transition-opacity duration-200">
                      Vote
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {poll.isClosed && <p className="text-gray-500 text-center mt-5 italic">This poll is closed.</p>}
      {hasVoted && !poll.isClosed && (
        <div className="mt-5 text-center">
          <p className="text-white inline-block px-3 py-1 rounded-full bg-green-400 border border-green-400">You have voted!</p>
        </div>
      )}
    </div>
  );
};

export default PollCard;