import React, { useState, useEffect } from 'react';
import { TechnologyCard } from '../Cards/TechnologyCard';
import { Vote, X, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';

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
  discussionPhase: {
    technologyId: string;
    technology: any;
    proposerId: string;
    discussionEndTime: number;
    isReady: boolean;
    readyCount: number;
    requiredCount: number;
  } | null;
  onVote: (technologyId: string, vote: boolean) => void;
  onReadyToVote: (technologyId: string) => void;
}

export const PlayerVoting: React.FC<PlayerVotingProps> = ({
  pendingVote,
  proposerName,
  voteStatus,
  discussionPhase,
  onVote,
  onReadyToVote,
}) => {
  const hasVoted = voteStatus?.hasVoted ?? false;
  const myVote = voteStatus?.myVote;
  const totalVotes = voteStatus?.totalVotes ?? 0;
  const requiredVotes = voteStatus?.requiredVotes ?? 0;

  // Countdown timer for discussion phase
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!discussionPhase) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((discussionPhase.discussionEndTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [discussionPhase]);

  const isInDiscussion = discussionPhase !== null && secondsLeft > 0;
  const isReady = discussionPhase?.isReady ?? false;

  // Format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for discussion timer
  const timerProgress = discussionPhase
    ? Math.max(0, Math.min(100, (secondsLeft / 90) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-3 sm:p-4 pb-6 sm:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700">
          
          {/* Discussion Phase Header */}
          {isInDiscussion ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="bg-amber-600/20 rounded-full p-1.5">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                  Discutete la Proposta
                </h1>
              </div>
              <p className="text-amber-300/80 text-center mb-3 text-xs sm:text-sm">
                Parlate tra voi prima di votare!
              </p>

              {/* Countdown Timer */}
              <div className="mb-4 sm:mb-5">
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className={`text-2xl sm:text-3xl font-mono font-bold ${
                      secondsLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-300'
                    }`}>
                      {formatTime(secondsLeft)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        secondsLeft <= 10 ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${timerProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-2 text-center">
                Vota sulla Proposta
              </h1>
            </>
          )}

          <p className="text-gray-300 text-center mb-4 sm:mb-5 text-sm sm:text-base">
            <span className="font-bold text-gray-100">{proposerName}</span> ha proposto questa tecnologia
          </p>

          {/* Technology Card */}
          <div className="mb-4 sm:mb-5">
            <div className="bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-700">
              <TechnologyCard
                technology={pendingVote.technology}
                isSelectable={false}
                isInHand={true}
                showVotingEffects={false}
              />
            </div>
          </div>

          {/* Discussion Phase: Ready Button */}
          {isInDiscussion && (
            <div className="space-y-3 sm:space-y-4">
              {!isReady ? (
                <button
                  onClick={() => onReadyToVote(pendingVote.technologyId)}
                  className="w-full font-semibold py-3 sm:py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base bg-amber-600 hover:bg-amber-500 active:bg-amber-400 text-white"
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  Pronto a Votare
                </button>
              ) : (
                <div className="p-3 sm:p-4 bg-gray-800 rounded-lg border-2 border-amber-600/40">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <p className="text-center text-amber-300 font-semibold text-sm sm:text-base">
                      Sei pronto! In attesa degli altri...
                    </p>
                  </div>
                </div>
              )}

              {/* Ready count */}
              {discussionPhase && discussionPhase.requiredCount > 0 && (
                <div className="bg-gray-800 rounded-lg p-2.5 border border-gray-700">
                  <p className="text-center text-xs sm:text-sm text-gray-300">
                    Pronti: <span className="font-bold text-amber-300">{discussionPhase.readyCount}</span>
                    <span className="text-gray-500"> / </span>
                    <span className="font-bold text-gray-200">{discussionPhase.requiredCount}</span>
                  </p>
                  <div className="mt-1.5 w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(discussionPhase.readyCount / discussionPhase.requiredCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Voting Phase: Vote Buttons - COLORI SEMANTICI */}
          {!isInDiscussion && (
            <>
              {hasVoted && (
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border-2 ${
                  myVote ? 'bg-emerald-900/20 border-emerald-600/40' : 'bg-red-900/20 border-red-600/40'
                }`}>
                  <p className={`text-center font-semibold text-sm sm:text-base ${
                    myVote ? 'text-emerald-200' : 'text-red-200'
                  }`}>
                    {myVote ? '✓ Hai votato: Sì' : '✗ Hai votato: No'}
                  </p>
                  <p className="text-center text-gray-400 text-xs sm:text-sm mt-2">
                    In attesa degli altri voti... ({totalVotes}/{requiredVotes})
                  </p>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        totalVotes >= requiredVotes 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                          : 'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                      style={{ width: `${requiredVotes > 0 ? (totalVotes / requiredVotes) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {!hasVoted && requiredVotes > 0 && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800 rounded-lg border-2 border-blue-600/30">
                  <p className="text-center text-blue-200 text-xs sm:text-sm font-semibold">
                    Esprimi il tuo voto!
                  </p>
                  <p className="text-center text-gray-400 text-xs mt-1">
                    Voti ricevuti: {totalVotes}/{requiredVotes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    if (hasVoted) return;
                    console.log('🗳️ Player voting YES on technology:', pendingVote.technologyId);
                    onVote(pendingVote.technologyId, true);
                  }}
                  disabled={hasVoted}
                  className={`font-semibold py-4 sm:py-5 px-4 rounded-xl transition-all duration-200 shadow-md flex flex-col items-center justify-center gap-2 text-sm sm:text-base ${
                    hasVoted
                      ? myVote === true
                        ? 'bg-emerald-800/40 text-emerald-300 cursor-not-allowed ring-2 ring-emerald-500/50'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-br from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 active:from-emerald-500 active:to-emerald-400 text-white hover:shadow-xl active:shadow-md'
                  }`}
                >
                  <Vote className="w-7 h-7 sm:w-8 sm:h-8" />
                  <span className="font-bold">{hasVoted && myVote === true ? 'Votato Sì' : 'Vota Sì'}</span>
                </button>
                <button
                  onClick={() => {
                    if (hasVoted) return;
                    console.log('🗳️ Player voting NO on technology:', pendingVote.technologyId);
                    onVote(pendingVote.technologyId, false);
                  }}
                  disabled={hasVoted}
                  className={`font-semibold py-4 sm:py-5 px-4 rounded-xl transition-all duration-200 shadow-md flex flex-col items-center justify-center gap-2 text-sm sm:text-base ${
                    hasVoted
                      ? myVote === false
                        ? 'bg-red-800/40 text-red-300 cursor-not-allowed ring-2 ring-red-500/50'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-br from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 active:from-red-500 active:to-red-400 text-white hover:shadow-xl active:shadow-md'
                  }`}
                >
                  <X className="w-7 h-7 sm:w-8 sm:h-8" />
                  <span className="font-bold">{hasVoted && myVote === false ? 'Votato No' : 'Vota No'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
