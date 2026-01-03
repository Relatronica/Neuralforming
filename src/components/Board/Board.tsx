import React from 'react';
import { Technology, PlayerState, VoteResult } from '../../game/types';
import { ParliamentHemicycle } from './ParliamentHemicycle';
import { Landmark } from 'lucide-react';

interface BoardProps {
  technologies: Technology[];
  players: PlayerState[];
  currentPlayerId: string;
  voteResult?: VoteResult | null;
}

export const Board: React.FC<BoardProps> = ({ players, currentPlayerId, voteResult = null }) => {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  if (!currentPlayer) return null;

  return (
    <div className="space-y-1.5 h-full overflow-y-auto">
      {/* Immagine Home */}
      <div className="bg-gray-800 rounded-lg p-1.5 shadow-sm border border-gray-700">
        <img 
          src="/images/home.jpg" 
          alt="Home" 
          className="w-full h-auto rounded-lg object-cover"
        />
      </div>

      {/* Emiciclo Parlamentare - compatto */}
      <div className="bg-gray-800 rounded-lg p-1.5 shadow-sm border border-gray-700">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Landmark className="w-3 h-3 text-gray-300" />
          <h3 className="text-[10px] font-bold text-gray-100">Parlamento</h3>
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
