import React from 'react';
import { PlayerState } from '../../game/types';
import { PlayerCard } from './PlayerCard';

interface PlayersListProps {
  players: PlayerState[];
  currentPlayerId: string;
  winnerId: string | null;
}

export const PlayersList: React.FC<PlayersListProps> = ({ players, currentPlayerId, winnerId }) => {
  // Separa giocatori umani e AI
  const humanPlayers = players.filter(p => !p.isAI);
  const aiPlayers = players.filter(p => p.isAI);

  // In multiplayer, tutti i giocatori sono umani, quindi mostriamo tutti
  // In single-player, mostriamo il giocatore umano e gli AI separatamente
  const isMultiplayer = humanPlayers.length > 1;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 shadow-lg">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Giocatori</h2>
      
      {isMultiplayer ? (
        // Multiplayer: mostra tutti i giocatori umani
        <div className="space-y-2">
          {humanPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentPlayerId}
              isWinner={player.id === winnerId}
            />
          ))}
        </div>
      ) : (
        // Single-player: mostra giocatore umano e AI separatamente
        <>
          {humanPlayers.length > 0 && (
            <div className="mb-3">
              <PlayerCard
                player={humanPlayers[0]}
                isCurrentPlayer={humanPlayers[0].id === currentPlayerId}
                isWinner={humanPlayers[0].id === winnerId}
              />
            </div>
          )}

          {aiPlayers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Avversari AI</h3>
              {aiPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentPlayer={player.id === currentPlayerId}
                  isWinner={player.id === winnerId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

