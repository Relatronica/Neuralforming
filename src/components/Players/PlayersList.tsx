import React from 'react';
import { PlayerState } from '../../game/types';
import { PlayerCard } from './PlayerCard';
import { Users } from 'lucide-react';

interface PlayersListProps {
  players: PlayerState[];
  currentPlayerId: string;
  winnerId: string | null;
  disconnectedPlayerIds?: string[];
}

export const PlayersList: React.FC<PlayersListProps> = ({ players, currentPlayerId, winnerId, disconnectedPlayerIds = [] }) => {
  // Separa giocatori umani e AI
  const humanPlayers = players.filter(p => !p.isAI);
  const aiPlayers = players.filter(p => p.isAI);

  // In multiplayer, tutti i giocatori sono umani, quindi mostriamo tutti
  // In single-player, mostriamo il giocatore umano e gli AI separatamente
  const isMultiplayer = humanPlayers.length > 1;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 shadow-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-gray-400" />
        <h2 className="text-lg font-bold text-gray-100">Giocatori</h2>
        <span className="text-xs text-gray-500 ml-auto">{players.length} in gioco</span>
      </div>
      
      {isMultiplayer ? (
        // Multiplayer: mostra tutti i giocatori umani con ordine turno
        <div className="space-y-2">
          {humanPlayers.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentPlayerId}
              isWinner={player.id === winnerId}
              isDisconnected={disconnectedPlayerIds.includes(player.id)}
              turnOrder={index + 1}
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
                turnOrder={1}
              />
            </div>
          )}

          {aiPlayers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">Avversari AI</h3>
              {aiPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentPlayer={player.id === currentPlayerId}
                  isWinner={player.id === winnerId}
                  turnOrder={humanPlayers.length + index + 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

