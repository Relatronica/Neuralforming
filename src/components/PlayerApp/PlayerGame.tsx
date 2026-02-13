import React, { useEffect, useState, useRef } from 'react';
import { useGameSocketContext } from '../../contexts/GameSocketContext';
import { PlayerVoting } from './PlayerVoting';
import { PlayerHand } from './PlayerHand';
import { PlayerDilemma } from './PlayerDilemma';
import { PlayerDilemmaVoting } from './PlayerDilemmaVoting';
import { PlayerConsequence } from './PlayerConsequence';
import { PlayerWaiting } from './PlayerWaiting';
import { NewsCard } from '../Game/NewsCard';
import { VoterPointsNotification } from '../Game/VoterPointsNotification';
import { GameTour } from './GameTour';
import { Users, Loader2, LogOut, Menu, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { TechnologyCard } from '../Cards/TechnologyCard';

// Vista dedicata per il proponente durante la votazione
const PlayerProposerView: React.FC<{
  pendingVote: { technologyId: string; technology: any; proposerId: string };
  voteStatus: { hasVoted: boolean; myVote: boolean | null; totalVotes: number; requiredVotes: number } | null;
  discussionPhase: {
    technologyId: string;
    technology: any;
    proposerId: string;
    discussionEndTime: number;
    isReady: boolean;
    readyCount: number;
    requiredCount: number;
  } | null;
}> = ({ pendingVote, voteStatus, discussionPhase }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

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
  const totalVotes = voteStatus?.totalVotes ?? 0;
  const requiredVotes = voteStatus?.requiredVotes ?? 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = discussionPhase
    ? Math.max(0, Math.min(100, (secondsLeft / 90) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-3 sm:p-4 pb-6 sm:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700">

          {/* Header */}
          {isInDiscussion ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="bg-amber-600/20 rounded-full p-1.5">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                  La tua Proposta
                </h1>
              </div>
              <p className="text-amber-300/80 text-center mb-3 text-xs sm:text-sm">
                Gli altri giocatori stanno discutendo la tua proposta
              </p>

              {/* Timer */}
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
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="bg-blue-600/20 rounded-full p-1.5">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                  Votazione in Corso
                </h1>
              </div>
              <p className="text-blue-300/80 text-center mb-3 text-xs sm:text-sm">
                I giocatori stanno votando sulla tua proposta
              </p>
            </>
          )}

          {/* Carta proposta */}
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

          {/* Progresso discussione */}
          {isInDiscussion && discussionPhase && discussionPhase.requiredCount > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 border border-amber-600/30 mb-4">
              <p className="text-center text-sm text-gray-300 mb-2">
                Giocatori pronti a votare
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-amber-300">{discussionPhase.readyCount}</span>
                <span className="text-gray-500 text-lg">/</span>
                <span className="text-xl font-bold text-gray-200">{discussionPhase.requiredCount}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(discussionPhase.readyCount / discussionPhase.requiredCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Progresso voti */}
          {!isInDiscussion && requiredVotes > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 border border-blue-600/30">
              <p className="text-center text-sm text-gray-300 mb-2">
                Voti ricevuti
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-blue-300">{totalVotes}</span>
                <span className="text-gray-500 text-lg">/</span>
                <span className="text-xl font-bold text-gray-200">{requiredVotes}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    totalVotes >= requiredVotes
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : 'bg-gradient-to-r from-blue-500 to-blue-400'
                  }`}
                  style={{ width: `${requiredVotes > 0 ? (totalVotes / requiredVotes) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Messaggio di attesa */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <p className="text-gray-500 text-xs sm:text-sm">
              {isInDiscussion ? 'La votazione inizierà quando tutti saranno pronti...' : 'In attesa che tutti votino...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlayerGameProps {
  roomId: string;
  playerId: string;
  playerColor?: string;
  playerIcon?: string;
  onLogout?: () => void;
}

export const PlayerGame: React.FC<PlayerGameProps> = ({ roomId, playerId, playerColor = '#3B82F6', playerIcon = 'landmark', onLogout }) => {
  const socketContext = useGameSocketContext();
  
  const {
    isConnected,
    masterConnected = true,
    roomInfo,
    gameState,
    playerState,
    pendingVote,
    voteStatus,
    discussionPhase,
    pendingDilemmaVote,
    dilemmaVoteStatus,
    dilemmaDiscussionPhase,
    sendAction,
    sendVote,
    sendReadyToVote,
    sendDilemmaVote,
    sendDilemmaReadyToVote,
    error,
    joinRoom,
  } = socketContext || {
    isConnected: false,
    masterConnected: true,
    roomInfo: null,
    gameState: null,
    playerState: null,
    pendingVote: null,
    discussionPhase: null,
    pendingDilemmaVote: null,
    dilemmaVoteStatus: null,
    dilemmaDiscussionPhase: null,
    sendAction: () => {},
    sendVote: () => {},
    sendReadyToVote: () => {},
    sendDilemmaVote: () => {},
    sendDilemmaReadyToVote: () => {},
    error: null,
    joinRoom: () => {},
  };

  // Stato locale per nascondere le news chiuse dall'utente
  // Usiamo un Set per tenere traccia degli ID delle news già chiuse
  const [dismissedNewsIds, setDismissedNewsIds] = useState<Set<string>>(new Set());
  const [lastNewsId, setLastNewsId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showVoterPointsNotification, setShowVoterPointsNotification] = useState(false);
  
  // Stato per il tour guidato
  const [showTour, setShowTour] = useState(false);
  const tourShownRef = useRef(false);
  
  // Stato per riconnessione
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wasConnectedRef = useRef(false);

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

  // Mostra automaticamente la notifica dei punti votanti quando disponibile
  // Usa un ref per tracciare se abbiamo già mostrato questa notifica
  const voterPointsShownRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!gameState) return;
    
    // Crea un ID univoco per questa notifica basato sui dati
    const notificationId = gameState.voterPointsInfo 
      ? JSON.stringify(gameState.voterPointsInfo.map(v => ({ playerId: v.playerId, vote: v.vote })))
      : null;
    
    // Mostra la notifica solo se:
    // 1. voterPointsInfo è disponibile
    // 2. Non è già mostrata
    // 3. Non abbiamo già mostrato questa specifica notifica
    if (
      gameState.voterPointsInfo && 
      gameState.voterPointsInfo.length > 0 && 
      !showVoterPointsNotification &&
      notificationId !== voterPointsShownRef.current
    ) {
      // Piccolo delay per permettere al risultato della votazione di essere mostrato prima
      const timer = setTimeout(() => {
        setShowVoterPointsNotification(true);
        voterPointsShownRef.current = notificationId;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // Reset il ref quando voterPointsInfo cambia (nuova votazione)
    if (!gameState.voterPointsInfo) {
      voterPointsShownRef.current = null;
    }
  }, [gameState?.voterPointsInfo, showVoterPointsNotification]);

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

  // Traccia stato di riconnessione
  useEffect(() => {
    if (isConnected) {
      wasConnectedRef.current = true;
      // Se eravamo disconnessi e ora siamo connessi, mostra stato di riconnessione
      if (isReconnecting) {
        // Aspetta un po' per assicurarsi che la riconnessione sia completa
        const timer = setTimeout(() => {
          setIsReconnecting(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else if (wasConnectedRef.current && roomInfo?.isGameStarted) {
      // Eravamo connessi e ora siamo disconnessi durante una partita
      setIsReconnecting(true);
    }
  }, [isConnected, roomInfo?.isGameStarted]);

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

  // Mostra il tour quando il gioco inizia per la prima volta
  useEffect(() => {
    // Mostra il tour solo se:
    // 1. Il gioco è iniziato (gameState esiste)
    // 2. Non abbiamo già mostrato il tour in questa sessione
    // 3. Il tour non è stato completato in precedenza (controllo localStorage)
    if (gameState && !tourShownRef.current && currentPhase === 'development') {
      const tourCompleted = localStorage.getItem('neuralforming_tour_completed');
      if (!tourCompleted) {
        // Aspetta un po' per assicurarsi che il DOM sia renderizzato
        const timer = setTimeout(() => {
          setShowTour(true);
          tourShownRef.current = true;
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        tourShownRef.current = true;
      }
    }
  }, [gameState, currentPhase]);

  // Handler per completare il tour
  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('neuralforming_tour_completed', 'true');
  };

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

  // Votazione in corso (se non sei il proponente) - include fase di discussione
  if (pendingVote && currentPlayer && currentPlayer.id !== pendingVote.proposerId) {
    return (
      <PlayerVoting
        pendingVote={pendingVote}
        proposerName={gameState.players.find(p => p.id === pendingVote.proposerId)?.name || 'Un giocatore'}
        voteStatus={voteStatus}
        discussionPhase={discussionPhase}
        onVote={sendVote}
        onReadyToVote={sendReadyToVote}
      />
    );
  }

  // Votazione in corso - vista del PROPONENTE (vede timer, progresso e la propria carta)
  if (pendingVote && currentPlayer && currentPlayer.id === pendingVote.proposerId) {
    return (
      <PlayerProposerView
        pendingVote={pendingVote}
        voteStatus={voteStatus}
        discussionPhase={discussionPhase}
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

  // Handler per nuova partita
  const handleNewGame = () => {
    if (window.confirm('Vuoi uscire dalla partita corrente e iniziare una nuova partita?')) {
      // Pulisci la sessione
      localStorage.removeItem('neuralforming_player_session');
      // Chiama onLogout se disponibile
      if (onLogout) {
        onLogout();
      } else {
        // Fallback: ricarica la pagina
        window.location.reload();
      }
    }
    setShowMenu(false);
  };

  // Handler per rivedere il tour
  const handleShowTourAgain = () => {
    setShowTour(true);
    tourShownRef.current = false;
    setShowMenu(false);
  };

  // Componente per il menu in alto
  const GameMenu = () => (
    <div className="fixed top-4 right-4 z-40" data-tour="menu">
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-gray-300" />
        </button>
        {showMenu && (
          <>
            {/* Overlay per chiudere il menu cliccando fuori */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowMenu(false)}
            />
            {/* Menu dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-40">
              <div className="p-2">
                <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700 mb-1">
                  {playerId}
                </div>
                <button
                  onClick={handleShowTourAgain}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Rivedi il Tour
                </button>
                <button
                  onClick={handleNewGame}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Nuova Partita
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Wrapper per mostrare le news se presenti
  const contentWithNews = (content: React.ReactNode) => {
    // Verifica se la news corrente è stata chiusa dall'utente
    const isNewsDismissed = gameState.currentNews && dismissedNewsIds.has(gameState.currentNews.id);
    const shouldShowNews = gameState.currentNews && !isNewsDismissed;

    // PlayerHand ha già il suo layout, quindi non wrappiamo di nuovo
    if (currentPhase === 'development') {
      return (
        <>
          <GameTour 
            run={showTour}
            onComplete={handleTourComplete}
            currentPhase={currentPhase}
            hasNews={!!shouldShowNews}
          />
          <GameMenu />
          {/* Banner di riconnessione */}
          {isReconnecting && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white p-3 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-semibold">Riconnessione in corso...</span>
              </div>
            </div>
          )}
          {/* Banner master disconnesso */}
          {!masterConnected && !isReconnecting && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center shadow-lg animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-semibold">Il tabellone di gioco si è disconnesso. In attesa di riconnessione...</span>
              </div>
            </div>
          )}
          {shouldShowNews && gameState.currentNews && (
            <div className={`fixed left-0 right-0 z-50 p-3 sm:p-4 max-w-2xl mx-auto ${(isReconnecting || !masterConnected) ? 'top-12' : 'top-0'}`} data-tour="news">
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
          {gameState.voterPointsInfo && gameState.voterPointsInfo.length > 0 && showVoterPointsNotification && (
            <VoterPointsNotification
              voterPoints={gameState.voterPointsInfo}
              players={gameState.players}
              onDismiss={() => {
                setShowVoterPointsNotification(false);
              }}
              autoCloseDelay={5000}
            />
          )}
          {content}
        </>
      );
    }
    
    // Per altre fasi, wrappiamo normalmente
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-3 sm:p-4">
        <GameTour 
          run={showTour}
          onComplete={handleTourComplete}
          currentPhase={currentPhase}
          hasNews={!!shouldShowNews}
        />
        <GameMenu />
        {/* Banner di riconnessione */}
        {isReconnecting && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white p-3 text-center shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-semibold">Riconnessione in corso...</span>
            </div>
          </div>
        )}
        {/* Banner master disconnesso */}
        {!masterConnected && !isReconnecting && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-semibold">Il tabellone di gioco si è disconnesso. In attesa di riconnessione...</span>
            </div>
          </div>
        )}
        <div className={`max-w-2xl mx-auto ${(isReconnecting || !masterConnected) ? 'mt-12' : ''}`}>
          {shouldShowNews && gameState.currentNews && (
            <div className="mb-4" data-tour="news">
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
          {gameState.voterPointsInfo && gameState.voterPointsInfo.length > 0 && showVoterPointsNotification && (
            <VoterPointsNotification
              voterPoints={gameState.voterPointsInfo}
              players={gameState.players}
              onDismiss={() => {
                setShowVoterPointsNotification(false);
              }}
              autoCloseDelay={5000}
            />
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
      // In multiplayer con votazione dilemma attiva: mostra il dilemma a TUTTI i giocatori
      if (pendingDilemmaVote && gameState.currentDilemma) {
        return contentWithNews(
          <PlayerDilemmaVoting
            dilemma={gameState.currentDilemma}
            currentPlayerName={currentPlayerName}
            activeJoker={gameState.activeJoker}
            dilemmaDiscussionPhase={dilemmaDiscussionPhase}
            dilemmaVoteStatus={dilemmaVoteStatus}
            onVote={(optionIndex) => sendDilemmaVote(pendingDilemmaVote.dilemmaId, optionIndex)}
            onReadyToVote={() => sendDilemmaReadyToVote(pendingDilemmaVote.dilemmaId)}
          />
        );
      }
      // Fallback single player o se la votazione non è ancora partita
      if (gameState.currentDilemma && isMyTurn) {
        return contentWithNews(
          <PlayerDilemma
            dilemma={gameState.currentDilemma}
            activeJoker={gameState.activeJoker}
            onResolve={(option) => sendAction('resolveDilemma', { option })}
          />
        );
      }
      // Se non è il suo turno e non c'è votazione, mostra attesa
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

