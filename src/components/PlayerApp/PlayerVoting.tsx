import React from 'react';
import { TechnologyCard } from '../Cards/TechnologyCard';
import { Vote, X } from 'lucide-react';

interface PlayerVotingProps {
  pendingVote: {
    technologyId: string;
    technology: any;
    proposerId: string;
  };
  proposerName: string;
  voteStatus: {
    hasVoted: boolean;
    myVote: boolean | null;
    totalVotes: number;
    requiredVotes: number;
  } | null;
  onVote: (technologyId: string, vote: boolean) => void;
}

export const PlayerVoting: React.FC<PlayerVotingProps> = ({
  pendingVote,
  proposerName,
  voteStatus,
  onVote,
}) => {
  const hasVoted = voteStatus?.hasVoted ?? false;
  const myVote = voteStatus?.myVote;
  const totalVotes = voteStatus?.totalVotes ?? 0;
  const requiredVotes = voteStatus?.requiredVotes ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-3 sm:p-4 pb-6 sm:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2 text-center">
            Vota sulla Proposta
          </h1>
          <p className="text-gray-300 text-center mb-4 sm:mb-6 text-sm sm:text-base">
            {proposerName} ha proposto questa tecnologia
          </p>

          <div className="mb-4 sm:mb-6">
            <div className="bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-700">
              <TechnologyCard
                technology={pendingVote.technology}
                isSelectable={false}
                isInHand={true}
                showVotingEffects={true}
              />
            </div>
          </div>

          {hasVoted && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800 rounded-lg border-2 border-gray-600">
              <p className="text-center text-gray-200 font-semibold text-sm sm:text-base">
                ✓ Hai già votato: <span className="font-bold">{myVote ? 'Sì' : 'No'}</span>
              </p>
              <p className="text-center text-gray-300 text-xs sm:text-sm mt-2">
                Voti ricevuti: {totalVotes}/{requiredVotes}
              </p>
            </div>
          )}

          {!hasVoted && requiredVotes > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800 rounded-lg border-2 border-gray-600">
              <p className="text-center text-gray-300 text-xs sm:text-sm">
                Voti ricevuti: {totalVotes}/{requiredVotes}
              </p>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => {
                if (hasVoted) return;
                console.log('🗳️ Player voting YES on technology:', pendingVote.technologyId);
                onVote(pendingVote.technologyId, true);
              }}
              disabled={hasVoted}
              className={`w-full font-semibold py-3 sm:py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg active:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base ${
                hasVoted
                  ? myVote === true
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white'
              }`}
            >
              <Vote className="w-5 h-5 sm:w-6 sm:h-6" />
              {hasVoted && myVote === true ? 'Hai votato Sì' : 'Vota Sì'}
            </button>
            <button
              onClick={() => {
                if (hasVoted) return;
                console.log('🗳️ Player voting NO on technology:', pendingVote.technologyId);
                onVote(pendingVote.technologyId, false);
              }}
              disabled={hasVoted}
              className={`w-full font-semibold py-3 sm:py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg active:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base ${
                hasVoted
                  ? myVote === false
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white'
              }`}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
              {hasVoted && myVote === false ? 'Hai votato No' : 'Vota No'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

