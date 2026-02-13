import React, { useState, useEffect } from 'react';
import { Dilemma } from '../../game/types';
import { DilemmaCard } from '../Cards/DilemmaCard';
import { Scale, Clock, CheckCircle2, MessageCircle } from 'lucide-react';

interface PlayerDilemmaVotingProps {
  dilemma: Dilemma;
  currentPlayerName: string;
  activeJoker?: any;
  // Discussion phase
  dilemmaDiscussionPhase: {
    dilemmaId: string;
    dilemma: Dilemma;
    currentPlayerId: string;
    discussionEndTime: number;
    isReady: boolean;
    readyCount: number;
    requiredCount: number;
  } | null;
  // Vote status
  dilemmaVoteStatus: {
    hasVoted: boolean;
    myOptionIndex: number | null;
    totalVotes: number;
    requiredVotes: number;
  } | null;
  onVote: (optionIndex: number) => void;
  onReadyToVote: () => void;
}

export const PlayerDilemmaVoting: React.FC<PlayerDilemmaVotingProps> = ({
  dilemma,
  currentPlayerName,
  activeJoker,
  dilemmaDiscussionPhase,
  dilemmaVoteStatus,
  onVote,
  onReadyToVote,
}) => {
  const hasVoted = dilemmaVoteStatus?.hasVoted ?? false;
  const myOptionIndex = dilemmaVoteStatus?.myOptionIndex ?? null;
  const totalVotes = dilemmaVoteStatus?.totalVotes ?? 0;
  const requiredVotes = dilemmaVoteStatus?.requiredVotes ?? 0;

  // Countdown timer for discussion phase
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!dilemmaDiscussionPhase) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((dilemmaDiscussionPhase.discussionEndTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [dilemmaDiscussionPhase]);

  const isInDiscussion = dilemmaDiscussionPhase !== null && secondsLeft > 0;
  const isReady = dilemmaDiscussionPhase?.isReady ?? false;

  // Format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for discussion timer (60 seconds total)
  const timerProgress = dilemmaDiscussionPhase
    ? Math.max(0, Math.min(100, (secondsLeft / 60) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-3 sm:p-4 pb-6 sm:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
              Dilemma Etico
            </h1>
          </div>

          <p className="text-gray-300 text-center mb-3 text-sm sm:text-base">
            Il turno di <span className="font-bold text-gray-100">{currentPlayerName}</span> — Tutti votano!
          </p>

          {/* Discussion Phase Header */}
          {isInDiscussion && (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="bg-amber-600/20 rounded-full p-1.5">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-100">
                  Discutete il Dilemma
                </p>
              </div>
              <p className="text-amber-300/80 text-center mb-3 text-xs sm:text-sm">
                Parlate tra voi e cercate di convincere gli altri!
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
          )}

          {/* Dilemma Card - mostra titolo, descrizione e opzioni */}
          <div className="mb-4 sm:mb-5">
            <div className="bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-700">
              <DilemmaCard
                dilemma={dilemma}
                onSelectOption={(option) => {
                  // Cliccabile solo durante la fase di voto (non durante la discussione)
                  if (!isInDiscussion && !hasVoted) {
                    const idx = dilemma.options.findIndex(o => o.text === option.text);
                    if (idx >= 0) onVote(idx);
                  }
                }}
                activeJoker={activeJoker}
                isInteractive={!isInDiscussion && !hasVoted} // Interattivo solo durante il voto
                showOptions={true} // Mostra SEMPRE le opzioni per permettere la discussione
                selectedOption={myOptionIndex !== null ? dilemma.options[myOptionIndex] : undefined}
              />
            </div>
          </div>

          {/* Vote progress (durante la fase di voto) */}
          {!isInDiscussion && requiredVotes > 0 && (
            <div className={`mb-4 p-2.5 rounded-lg border ${
              hasVoted 
                ? 'bg-amber-900/20 border-amber-600/30' 
                : 'bg-blue-900/20 border-blue-600/30'
            }`}>
              <p className={`text-center text-xs sm:text-sm font-semibold ${
                hasVoted ? 'text-amber-200' : 'text-blue-200'
              }`}>
                {hasVoted ? 'Hai votato! In attesa degli altri...' : 'Clicca su un\'opzione per votare'}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-xs text-gray-400">Voti:</span>
                <span className="font-bold text-amber-300 text-xs">{totalVotes}</span>
                <span className="text-gray-500 text-xs">/</span>
                <span className="font-bold text-gray-200 text-xs">{requiredVotes}</span>
              </div>
              <div className="mt-1.5 w-full bg-gray-700 rounded-full h-2">
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

          {/* Discussion Phase: Ready Button */}
          {isInDiscussion && (
            <div className="space-y-3 sm:space-y-4 mb-4">
              {!isReady ? (
                <button
                  onClick={onReadyToVote}
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
              {dilemmaDiscussionPhase && dilemmaDiscussionPhase.requiredCount > 0 && (
                <div className="bg-gray-800 rounded-lg p-2.5 border border-gray-700">
                  <p className="text-center text-xs sm:text-sm text-gray-300">
                    Pronti: <span className="font-bold text-amber-300">{dilemmaDiscussionPhase.readyCount}</span>
                    <span className="text-gray-500"> / </span>
                    <span className="font-bold text-gray-200">{dilemmaDiscussionPhase.requiredCount}</span>
                  </p>
                  <div className="mt-1.5 w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(dilemmaDiscussionPhase.readyCount / dilemmaDiscussionPhase.requiredCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nota durante la discussione: le opzioni si vedono sopra */}
          {isInDiscussion && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 italic">
                Leggi le opzioni qui sopra e discuti con gli altri giocatori
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
