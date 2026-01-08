import React, { useEffect, useState, useRef } from 'react';
import { useGameSocketContext } from '../../contexts/GameSocketContext';
import { PlayerVoting } from './PlayerVoting';
import { PlayerHand } from './PlayerHand';
import { PlayerDilemma } from './PlayerDilemma';
import { PlayerConsequence } from './PlayerConsequence';
import { PlayerWaiting } from './PlayerWaiting';
import { NewsCard } from '../Game/NewsCard';
import { Users, Loader2 } from 'lucide-react';

interface PlayerGameProps {
  roomId: string;
  playerId: string;
  playerColor?: string;
  playerIcon?: string;
  onLogout?: () => void;
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

  // Stato locale per nascondere le news chiuse dall'utente
  // Usiamo un Set per tenere traccia degli ID delle news già chiuse
  const [dismissedNewsIds, setDismissedNewsIds] = useState<Set<string>>(new Set());
  const [lastNewsId, setLastNewsId] = useState<string | null>(null);

  // Reset delle news chiuse quando arriva una nuova news (ID diverso)
  useEffect(() => {
    if (gameState?.currentNews) {
      const currentNewsId = gameState.currentNews.id;
      
      // Se è una nuova news (ID diverso da quello precedente), rimuovi le news vecchie dal Set
      if (currentNewsId !== lastNewsId) {
        setDismissedNewsIds(new Set()); // Reset quando arriva una nuova news
        setLastNewsId(currentNewsId);
      }
    } else {
      // Se non c'è news, pulisci tutto
      setDismissedNewsIds(new Set());
      setLastNewsId(null);
    }
  }, [gameState?.currentNews?.id, lastNewsId]);

  // Unisciti alla room quando il socket è connesso
  // IMPORTANTE: usa un ref per evitare doppi tentativi di joinRoom
  const joinAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Reset del flag quando cambiano roomId o playerId
    joinAttemptedRef.current = false;
  }, [roomId, playerId]);

  useEffect(() => {
    if (isConnected && roomId && playerId && !joinAttemptedRef.current) {
      // Verifica se siamo già nella lista dei giocatori
      const alreadyInRoom = roomInfo?.players.some(p => p.name === playerId || p.id === playerId);
      
      if (!alreadyInRoom) {
        // Marca come tentato per evitare doppi tentativi
        joinAttemptedRef.current = true;
        console.log('📤 Attempting to join room:', { roomId, playerId });
        joinRoom(playerId, playerColor, playerIcon);
      } else {
        console.log('✅ Already in room, skipping joinRoom');
      }
    }
  }, [isConnected, roomId, roomInfo, playerId, playerColor, playerIcon, joinRoom]);

  // Warning pre-refresh: avvisa l'utente se sta per uscire durante una partita attiva
  useEffect(() => {
    // Solo durante una partita attiva (gioco iniziato e connesso)
    if (!gameState || !isConnected || !roomInfo?.isGameStarted) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Previeni il refresh e mostra un warning
      e.preventDefault();
      // I browser moderni mostrano un messaggio standard, ma possiamo comunque prevenire
      e.returnValue = 'Sei sicuro di voler uscire? Potresti perdere la connessione alla partita.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameState, isConnected, roomInfo?.isGameStarted]);

  // Trova il giocatore corrente
  // Usa playerState se disponibile (ha l'ID corretto dal server), altrimenti cerca per nome
  const currentPlayer = playerState || gameState?.players.find(p => 
    p.name === playerId || 
    p.id === playerId
  );

  const isMyTurn = !!(gameState && currentPlayer && gameState.currentPlayerId === currentPlayer.id);
  const currentPhase = gameState?.currentPhase;

  // Schermata di caricamento
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-700">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">Connessione...</h2>
          <p className="text-gray-300">Connessione al server in corso...</p>
        </div>
      </div>
    );
  }

  // Errore - ma solo se non è un errore di nome già usato (quello viene gestito diversamente)
  // Gli errori di nome già usato vengono mostrati con un messaggio più chiaro e un pulsante per tornare al login
  if (error) {
    const isNameTakenError = error.includes('Player name already taken') || error.includes('name already taken');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full text-center border border-gray-700">
          <h2 className="text-xl font-bold text-gray-200 mb-2">Errore</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          {isNameTakenError && (
            <button
              onClick={() => {
                // Pulisci le credenziali e torna al login
                localStorage.removeItem('neuralforming_player_session');
                window.location.reload(); // Ricarica per tornare al form di login
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Torna al Login
            </button>
          )}
        </div>
      </div>
    );
  }

  // Attesa che il gioco inizi
  // IMPORTANTE: Controlla solo roomInfo.isGameStarted, non gameState
  // perché gameState potrebbe arrivare con un leggero ritardo dopo gameStarted
  // Mostra la schermata di attesa solo se:
  // 1. roomInfo esiste (siamo nella room)
  // 2. Il gioco non è ancora iniziato
  // 3. Non c'è un errore (gli errori vengono mostrati prima)
  if (roomInfo && !roomInfo.isGameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full text-center border border-gray-700">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">In attesa...</h2>
          <p className="text-gray-300 mb-2">Connesso alla partita come <span className="font-semibold text-gray-100">{playerId}</span></p>
          <p className="text-gray-400 text-sm">Il master sta avviando la partita...</p>
        </div>
      </div>
    );
  }

  // Se roomInfo non esiste ancora, mostra un messaggio di connessione
  // Questo può accadere subito dopo il login, prima che arrivi l'update della room
  if (!roomInfo && isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full text-center border border-gray-700">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">Connessione...</h2>
          <p className="text-gray-300">Unendosi alla partita...</p>
        </div>
      </div>
    );
  }

  // Se il gioco è iniziato ma gameState non è ancora arrivato, mostra un messaggio di caricamento
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full text-center border border-gray-700">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">Caricamento partita...</h2>
          <p className="text-gray-300">Il master sta sincronizzando lo stato del gioco...</p>
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

  // Il giocatore deve esistere
  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full text-center border border-gray-700">
          <h2 className="text-xl font-bold text-gray-100 mb-2">Giocatore non trovato</h2>
          <p className="text-gray-300">Controlla che il nome sia corretto</p>
        </div>
      </div>
    );
  }

  // Wrapper per mostrare le news se presenti
  const contentWithNews = (content: React.ReactNode) => {
    // Verifica se la news corrente è stata chiusa dall'utente
    const isNewsDismissed = gameState.currentNews && dismissedNewsIds.has(gameState.currentNews.id);
    const shouldShowNews = gameState.currentNews && !isNewsDismissed;

    // PlayerHand ha già il suo layout, quindi non wrappiamo di nuovo
    if (currentPhase === 'development') {
      return (
        <>
          {shouldShowNews && gameState.currentNews && (
            <div className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 max-w-2xl mx-auto">
              <NewsCard
                news={gameState.currentNews}
                onDismiss={() => {
                  // Nascondi la news localmente aggiungendo il suo ID al Set
                  if (gameState.currentNews) {
                    setDismissedNewsIds(prev => new Set(prev).add(gameState.currentNews!.id));
                  }
                }}
              />
            </div>
          )}
          {content}
        </>
      );
    }
    
    // Per altre fasi, wrappiamo normalmente
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-3 sm:p-4">
        <div className="max-w-2xl mx-auto">
          {shouldShowNews && gameState.currentNews && (
            <div className="mb-4">
              <NewsCard
                news={gameState.currentNews}
                onDismiss={() => {
                  // Nascondi la news localmente aggiungendo il suo ID al Set
                  if (gameState.currentNews) {
                    setDismissedNewsIds(prev => new Set(prev).add(gameState.currentNews!.id));
                  }
                }}
              />
            </div>
          )}
          {content}
        </div>
      </div>
    );
  };

  // Mostra la fase appropriata
  const currentPlayerName = gameState.players.find(p => p.id === gameState.currentPlayerId)?.name || 'Un giocatore';
  
  switch (currentPhase) {
    case 'development':
      return contentWithNews(
        <PlayerHand
          player={currentPlayer}
          gameState={gameState}
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayerName}
          onDrawTechnology={() => sendAction('drawTechnology', {})}
          onAddTechnology={(tech) => sendAction('addTechnology', { technology: tech })}
        />
      );
    
    case 'dilemma':
      // Mostra il dilemma solo al giocatore di turno
      if (gameState.currentDilemma && isMyTurn) {
        return contentWithNews(
          <PlayerDilemma
            dilemma={gameState.currentDilemma}
            activeJoker={gameState.activeJoker}
            onResolve={(option) => sendAction('resolveDilemma', { option })}
          />
        );
      }
      // Se non è il suo turno, mostra PlayerHand con messaggio di attesa
      return contentWithNews(
        <PlayerHand
          player={currentPlayer}
          gameState={gameState}
          isMyTurn={false}
          currentPlayerName={currentPlayerName}
          onDrawTechnology={() => sendAction('drawTechnology', {})}
          onAddTechnology={(tech) => sendAction('addTechnology', { technology: tech })}
        />
      );
    
    case 'consequence':
      // Mostra la consequence solo al giocatore di turno
      if (gameState.currentConsequence && isMyTurn) {
        return contentWithNews(
          <PlayerConsequence
            consequence={gameState.currentConsequence}
            onContinue={() => sendAction('completeConsequence', {})}
          />
        );
      }
      // Se non è il suo turno, mostra PlayerHand con messaggio di attesa
      return contentWithNews(
        <PlayerHand
          player={currentPlayer}
          gameState={gameState}
          isMyTurn={false}
          currentPlayerName={currentPlayerName}
          onDrawTechnology={() => sendAction('drawTechnology', {})}
          onAddTechnology={(tech) => sendAction('addTechnology', { technology: tech })}
        />
      );
  }

  return <PlayerWaiting currentPlayerName="Preparazione..." />;
};

