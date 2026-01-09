import React from 'react';
import { Technology, PlayerState, VoteResult } from '../../game/types';
import { ParliamentHemicycle } from './ParliamentHemicycle';
import { Landmark } from 'lucide-react';

interface BoardProps {
  technologies: Technology[];
  players: PlayerState[];
  currentPlayerId: string;
  voteResult?: VoteResult | null;
  isVoting?: boolean;
}

export const Board: React.FC<BoardProps> = ({ players, currentPlayerId, voteResult = null, isVoting = false }) => {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  if (!currentPlayer) return null;

  // Mostra l'immagine quando c'è una votazione in corso o un risultato di votazione
  const showImage = isVoting || voteResult !== null;

  return (
    <div className="space-y-1.5 h-full overflow-y-auto">
      {/* Logo o Immagine Home */}
      <div className="bg-gray-800 rounded-lg p-1.5 shadow-sm border border-gray-700">
        {showImage ? (
          <img 
            src="/images/home.jpg" 
            alt="Home" 
            className="w-full h-auto rounded-lg object-cover"
          />
        ) : (
          <img 
            src="/images/logo/logo_neuralforming.png" 
            alt="Neuralforming Logo" 
            className="w-full h-50 mx-auto rounded-lg object-contain"
          />
        )}
      </div>

      {/* Emiciclo Parlamentare - compatto */}
      <div className="bg-gray-800 rounded-lg p-1.5 shadow-sm border border-gray-700">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Landmark className="w-4 h-4 text-gray-300" />
          <h3 className="text-sm font-bold text-gray-100">Parlamento</h3>
        </div>
        <ParliamentHemicycle
          players={players}
          currentPlayerId={currentPlayerId}
          mode={voteResult ? 'vote' : undefined}
          voteResult={voteResult || undefined}
        />
      </div>


    </div>
  );
};
