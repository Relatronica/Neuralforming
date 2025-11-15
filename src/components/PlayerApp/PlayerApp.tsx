import React, { useState } from 'react';
import { GameSocketProvider } from '../../contexts/GameSocketContext';
import { PlayerLogin } from './PlayerLogin';
import { PlayerGame } from './PlayerGame';

/**
 * PWA per i giocatori mobile
 * UI semplificata che mostra solo le azioni che il giocatore può fare:
 * - Votazioni su proposte
 * - Proposte di legge quando è il loro turno
 * - Dilemmi quando è il loro turno
 * - Consegue quando è il loro turno
 */
export const PlayerApp: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [playerIcon, setPlayerIcon] = useState<string | null>(null);

  const handleLogin = (room: string, player: string, color: string, icon: string) => {
    setRoomId(room);
    setPlayerId(player);
    setPlayerColor(color);
    setPlayerIcon(icon);
  };

  if (!roomId || !playerId) {
    return <PlayerLogin onLogin={handleLogin} />;
  }

  return (
    <GameSocketProvider roomId={roomId}>
      <PlayerGame 
        roomId={roomId} 
        playerId={playerId} 
        playerColor={playerColor || '#3B82F6'}
        playerIcon={playerIcon || 'landmark'}
      />
    </GameSocketProvider>
  );
};

