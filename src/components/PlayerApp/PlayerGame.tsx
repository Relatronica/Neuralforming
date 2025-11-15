import React, { useEffect } from 'react';
import { useGameSocketContext } from '../../contexts/GameSocketContext';
import { PlayerVoting } from './PlayerVoting';
import { PlayerHand } from './PlayerHand';
import { PlayerDilemma } from './PlayerDilemma';
import { PlayerConsequence } from './PlayerConsequence';
import { PlayerWaiting } from './PlayerWaiting';
import { Users, Loader2 } from 'lucide-react';

interface PlayerGameProps {
  roomId: string;
  playerId: string;
  playerColor?: string;
  playerIcon?: string;
}

export const PlayerGame: React.FC<PlayerGameProps> = ({ roomId, playerId, playerColor = '#3B82F6', playerIcon = 'landmark' }) => {
  const socketContext = useGameSocketContext();
  
  const {
    isConnected,
    roomInfo,
    gameState,
    playerState,
    pendingVote,
    voteStatus,
    sendAction,
    sendVote,
    error,
    joinRoom,
  } = socketContext || {
    isConnected: false,
    roomInfo: null,
    gameState: null,
    playerState: null,
    pendingVote: null,
    sendAction: () => {},
    sendVote: () => {},
    error: null,
    joinRoom: () => {},
  };

  // Unisciti alla room quando il socket è connesso
  useEffect(() => {
    if (isConnected && roomId && !roomInfo?.players.some(p => p.name === playerId || p.id === playerId)) {
      // Prova a unirti se non sei già nella lista
      joinRoom(playerId, playerColor, playerIcon);
    }
  }, [isConnected, roomId, roomInfo, playerId, playerColor, joinRoom]);

  // Trova il giocatore corrente
  // Usa playerState se disponibile (ha l'ID corretto dal server), altrimenti cerca per nome
  const currentPlayer = playerState || gameState?.players.find(p => 
    p.name === playerId || 
    p.id === playerId
  );

  const isMyTurn = gameState && currentPlayer && gameState.currentPlayerId === currentPlayer.id;
  const currentPhase = gameState?.currentPhase;

  // Schermata di caricamento
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connessione...</h2>
          <p className="text-gray-600">Connessione al server in corso...</p>
        </div>
      </div>
    );
  }

  // Errore
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Errore</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Attesa che il gioco inizi
  if (!gameState || !roomInfo?.isGameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">In attesa...</h2>
          <p className="text-gray-600">Il master sta avviando la partita...</p>
        </div>
      </div>
    );
  }

  // Votazione in corso (se non sei il proponente)
  if (pendingVote && currentPlayer && currentPlayer.id !== pendingVote.proposerId) {
    return (
      <PlayerVoting
        pendingVote={pendingVote}
        proposerName={gameState.players.find(p => p.id === pendingVote.proposerId)?.name || 'Un giocatore'}
        voteStatus={voteStatus}
        onVote={sendVote}
      />
    );
  }

  // Se non è il tuo turno, mostra attesa
  if (!isMyTurn) {
    const currentPlayerName = gameState.players.find(p => p.id === gameState.currentPlayerId)?.name || 'Un giocatore';
    return <PlayerWaiting currentPlayerName={currentPlayerName} />;
  }

  // Il tuo turno - mostra le azioni appropriate
  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Giocatore non trovato</h2>
          <p className="text-gray-600">Controlla che il nome sia corretto</p>
        </div>
      </div>
    );
  }

  // Mostra la fase appropriata
  switch (currentPhase) {
    case 'development':
      return (
        <PlayerHand
          player={currentPlayer}
          gameState={gameState}
          onDrawTechnology={() => sendAction('drawTechnology', {})}
          onAddTechnology={(tech) => sendAction('addTechnology', { technology: tech })}
        />
      );
    
    case 'dilemma':
      if (gameState.currentDilemma) {
        return (
          <PlayerDilemma
            dilemma={gameState.currentDilemma}
            activeJoker={gameState.activeJoker}
            onResolve={(option) => sendAction('resolveDilemma', { option })}
          />
        );
      }
      break;
    
    case 'consequence':
      if (gameState.currentConsequence) {
        return (
          <PlayerConsequence
            consequence={gameState.currentConsequence}
            onContinue={() => sendAction('completeConsequence', {})}
          />
        );
      }
      break;
  }

  return <PlayerWaiting currentPlayerName="Preparazione..." />;
};

