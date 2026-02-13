import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, PlayerState, Dilemma, DilemmaOption, DilemmaVoteResult } from '../game/types';

export interface DisconnectedPlayerInfo {
  id: string;
  name: string;
  color: string;
  icon?: string;
  disconnectedAt: number;
}

export interface RoomInfo {
  roomId: string;
  players: Array<{
    id: string;
    name: string;
    color: string;
    icon?: string;
    isMaster: boolean;
  }>;
  disconnectedPlayers: DisconnectedPlayerInfo[];
  isGameStarted: boolean;
  maxPlayers: number;
  masterSocketId?: string; // Socket ID del master (per identificare il master)
}

// Costante per il heartbeat del master
const MASTER_HEARTBEAT_INTERVAL_MS = 10000; // Deve corrispondere al server

export function useGameSocket(roomId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [masterConnected, setMasterConnected] = useState(true); // Stato connessione master
  const [pendingVote, setPendingVote] = useState<{
    technologyId: string;
    technology: any;
    proposerId: string;
  } | null>(null);
  const [voteStatus, setVoteStatus] = useState<{
    hasVoted: boolean;
    myVote: boolean | null;
    totalVotes: number;
    requiredVotes: number;
  } | null>(null);
  const [discussionPhase, setDiscussionPhase] = useState<{
    technologyId: string;
    technology: any;
    proposerId: string;
    discussionEndTime: number;
    isReady: boolean;
    readyCount: number;
    requiredCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dilemma voting state
  const [pendingDilemmaVote, setPendingDilemmaVote] = useState<{
    dilemmaId: string;
    dilemma: Dilemma;
    currentPlayerId: string;
  } | null>(null);
  const [dilemmaVoteStatus, setDilemmaVoteStatus] = useState<{
    hasVoted: boolean;
    myOptionIndex: number | null;
    totalVotes: number;
    requiredVotes: number;
  } | null>(null);
  const [dilemmaDiscussionPhase, setDilemmaDiscussionPhase] = useState<{
    dilemmaId: string;
    dilemma: Dilemma;
    currentPlayerId: string;
    discussionEndTime: number;
    isReady: boolean;
    readyCount: number;
    requiredCount: number;
  } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const isMasterRef = useRef<boolean>(false); // Traccia se siamo il master (abbiamo creato la room)
  const reconnectAttemptRef = useRef<number | null>(null); // Traccia il timeout per evitare richieste ripetute
  const persistentPlayerIdRef = useRef<string | null>(null); // Traccia il playerId persistente dal server
  const heartbeatIntervalRef = useRef<number | null>(null); // Interval per il master heartbeat

  useEffect(() => {
    // Connetti sempre, anche senza roomId (per creare room)
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    
    // Se c'è già un socket connesso, non crearne uno nuovo
    if (socketRef.current?.connected) {
      setSocket(socketRef.current);
      setIsConnected(true);
      // Se abbiamo un roomId, richiedi immediatamente le informazioni della room
      if (roomId) {
        socketRef.current.emit('requestRoomInfo', { roomId });
      }
      return () => {}; // Nessun cleanup necessario
    }

    // Se c'è un socket ma non è connesso, prova a riconnettere
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
      setSocket(socketRef.current);
      return () => {}; // Non chiudere, sta riconnettendo
    }

    // Crea un nuovo socket solo se non esiste
    if (socketRef.current) {
      return () => {}; // Non chiudere se esiste già
    }

    // Crea un nuovo socket
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'], // Fallback a polling se websocket fallisce
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity, // Riconnetti sempre
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false, // Riutilizza connessioni esistenti
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('✅ Socket connected');
      
      // Se abbiamo un roomId quando il socket si connette, richiedi le informazioni della room
      // NON fare joinRoom qui - lascia che PlayerGame lo gestisca quando necessario
      // Questo evita doppi tentativi di joinRoom
      if (roomId) {
        newSocket.emit('requestRoomInfo', { roomId });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      console.error('Connection error:', err);
    });

    newSocket.on('roomCreated', (data: { roomId: string }) => {
      // Quando creiamo una room, siamo il master
      isMasterRef.current = true;
      setRoomInfo({
        roomId: data.roomId,
        players: [],
        disconnectedPlayers: [],
        isGameStarted: false,
        maxPlayers: 5,
      });
    });

    newSocket.on('joinedRoom', (data: { roomId: string; success: boolean; error?: string }) => {
      if (!data.success) {
        const errorMsg = data.error || 'Failed to join room';
        console.error('❌ Join room failed:', errorMsg);
        setError(errorMsg);
        
        // Se l'errore è "Room not found", pulisci le credenziali
        // Nota: "Game already started" non è più un errore (mid-game join supportato)
        if (
          errorMsg.includes('not found') || 
          errorMsg.includes('Room not found')
        ) {
          console.log('🧹 Clearing session due to error:', errorMsg);
          try {
            localStorage.removeItem('neuralforming_player_session');
          } catch (e) {
            console.error('Failed to clear session:', e);
          }
        }
        
        // Se è un errore di nome già usato, emetti evento per gestirlo
        if (errorMsg.includes('Player name already taken') || errorMsg.includes('name already taken')) {
          console.log('⚠️ Player name already taken, emitting event');
          window.dispatchEvent(new CustomEvent('playerNameTaken', { detail: { roomId } }));
        }
      } else {
        console.log('✅ Successfully joined room:', roomId);
        setError(null);
        // Richiedi aggiornamento della room dopo il join
        if (roomId) {
          newSocket.emit('requestRoomInfo', { roomId });
        }
      }
    });

    newSocket.on('roomUpdate', (data: RoomInfo) => {
      console.log('📥 Room update received:', {
        roomId: data.roomId,
        masterSocketId: data.masterSocketId,
        currentSocketId: newSocket.id,
        playersCount: data.players.length,
        isGameStarted: data.isGameStarted,
        isMaster: isMasterRef.current,
      });
      setRoomInfo(data);
      
      // Verifica se dobbiamo riconnetterci come master
      // SOLO se:
      // 1. Siamo effettivamente il master (abbiamo creato la room)
      // 2. Il masterSocketId è impostato ma non corrisponde al nostro socket ID
      // 3. Non abbiamo già una richiesta di riconnessione in corso
      // 4. Abbiamo un roomId
      if (
        isMasterRef.current &&
        data.masterSocketId && 
        newSocket.id && 
        data.masterSocketId !== newSocket.id && 
        roomId &&
        !reconnectAttemptRef.current
      ) {
        console.log(`🔄 Master socket ID mismatch detected: server has ${data.masterSocketId}, client has ${newSocket.id}`);
        // Cancella eventuali timeout precedenti
        if (reconnectAttemptRef.current) {
          clearTimeout(reconnectAttemptRef.current);
        }
        
        // Aspetta un po' prima di riconnettersi per evitare loop infiniti
        reconnectAttemptRef.current = window.setTimeout(() => {
          // Verifica nuovamente che le condizioni siano ancora valide
          if (
            isMasterRef.current &&
            data.masterSocketId && 
            newSocket.id && 
            data.masterSocketId !== newSocket.id && 
            roomId
          ) {
            console.log(`🔄 Emitting reconnectAsMaster for room ${roomId}`);
            newSocket.emit('reconnectAsMaster', { roomId });
          }
          reconnectAttemptRef.current = null;
        }, 2000); // Aumentato a 2 secondi per ridurre la frequenza delle richieste
      } else if (data.masterSocketId && newSocket.id && data.masterSocketId === newSocket.id) {
        // Se il masterSocketId corrisponde, significa che siamo correttamente riconosciuti come master
        // Cancella eventuali timeout di riconnessione in corso
        if (reconnectAttemptRef.current) {
          clearTimeout(reconnectAttemptRef.current);
          reconnectAttemptRef.current = null;
        }
      }
    });
    
    // Se abbiamo un roomId quando il socket si connette, richiedi le informazioni della room
    if (roomId && newSocket.connected) {
      newSocket.emit('requestRoomInfo', { roomId });
    }

    newSocket.on('gameStateUpdate', (data: { gameState: GameState }) => {
      setGameState(data.gameState);
    });

    newSocket.on('playerStateUpdate', (data: { playerState: PlayerState; gameState: GameState }) => {
      setPlayerState(data.playerState);
      setGameState(data.gameState);
      // Salva il playerId persistente dal server per usarlo nel voteUpdate
      if (data.playerState?.id) {
        persistentPlayerIdRef.current = data.playerState.id;
      }
    });

    newSocket.on('discussionStarted', (data: { technologyId: string; technology: any; proposerId: string; discussionEndTime: number; discussionDurationMs: number }) => {
      console.log('💬 Discussion phase started:', data.technologyId);
      setPendingVote({
        technologyId: data.technologyId,
        technology: data.technology,
        proposerId: data.proposerId,
      });
      setDiscussionPhase({
        technologyId: data.technologyId,
        technology: data.technology,
        proposerId: data.proposerId,
        discussionEndTime: data.discussionEndTime,
        isReady: false,
        readyCount: 0,
        requiredCount: 0,
      });
      setVoteStatus({
        hasVoted: false,
        myVote: null,
        totalVotes: 0,
        requiredVotes: 0,
      });
    });

    newSocket.on('discussionUpdate', (data: { technologyId: string; readyPlayers: string[]; readyCount: number; requiredCount: number }) => {
      console.log(`💬 Discussion update: ${data.readyCount}/${data.requiredCount} ready`);
      setDiscussionPhase(prev => {
        if (!prev || prev.technologyId !== data.technologyId) return prev;
        return {
          ...prev,
          readyCount: data.readyCount,
          requiredCount: data.requiredCount,
          // Keep local isReady state (set optimistically by sendReadyToVote)
          isReady: prev.isReady,
        };
      });
    });

    newSocket.on('votingStarted', (data: { technologyId: string; technology: any; proposerId: string }) => {
      console.log('🗳️ Voting phase started (discussion ended):', data.technologyId);
      // Discussion ended, voting is now open
      setDiscussionPhase(null);
      setPendingVote(data);
      setVoteStatus({
        hasVoted: false,
        myVote: null,
        totalVotes: 0,
        requiredVotes: 0,
      });
    });

    newSocket.on('voteUpdate', (data: { technologyId: string; votes: Array<{ playerId: string; vote: boolean }>; totalVotes: number; requiredVotes: number }) => {
      // Usa il playerId persistente dal server (salvato durante playerStateUpdate)
      const myPersistentId = persistentPlayerIdRef.current;
      const myVoteEntry = myPersistentId ? data.votes.find(v => v.playerId === myPersistentId) : null;
      
      console.log(`📊 Vote update received: persistentPlayerId=${myPersistentId}, myVote=${myVoteEntry?.vote ?? 'none'}, total=${data.totalVotes}/${data.requiredVotes}`);
      
      setVoteStatus({
        hasVoted: myVoteEntry !== undefined,
        myVote: myVoteEntry?.vote ?? null,
        totalVotes: data.totalVotes,
        requiredVotes: data.requiredVotes,
      });
    });

    newSocket.on('votingComplete', (data: { technologyId: string; technology: any; proposerId: string; votes: Array<{ playerId: string; vote: boolean }> }) => {
      console.log('✅ Client received votingComplete from server:', {
        technologyId: data.technologyId,
        proposerId: data.proposerId,
        votesCount: data.votes.length,
      });
      setPendingVote(null);
      setVoteStatus(null);
      setDiscussionPhase(null);
      // NOTA: Il componente Game ascolta direttamente l'evento 'votingComplete' dal server
      // Non serve emettere un evento intermedio
    });

    // Dilemma voting events
    newSocket.on('dilemmaDiscussionStarted', (data: { dilemmaId: string; dilemma: Dilemma; currentPlayerId: string; discussionEndTime: number; discussionDurationMs: number }) => {
      console.log('💬 Dilemma discussion phase started:', data.dilemmaId);
      setPendingDilemmaVote({
        dilemmaId: data.dilemmaId,
        dilemma: data.dilemma,
        currentPlayerId: data.currentPlayerId,
      });
      setDilemmaDiscussionPhase({
        dilemmaId: data.dilemmaId,
        dilemma: data.dilemma,
        currentPlayerId: data.currentPlayerId,
        discussionEndTime: data.discussionEndTime,
        isReady: false,
        readyCount: 0,
        requiredCount: 0,
      });
      setDilemmaVoteStatus({
        hasVoted: false,
        myOptionIndex: null,
        totalVotes: 0,
        requiredVotes: 0,
      });
    });

    newSocket.on('dilemmaDiscussionUpdate', (data: { dilemmaId: string; readyPlayers: string[]; readyCount: number; requiredCount: number }) => {
      console.log(`💬 Dilemma discussion update: ${data.readyCount}/${data.requiredCount} ready`);
      setDilemmaDiscussionPhase(prev => {
        if (!prev || prev.dilemmaId !== data.dilemmaId) return prev;
        return {
          ...prev,
          readyCount: data.readyCount,
          requiredCount: data.requiredCount,
          isReady: prev.isReady,
        };
      });
    });

    newSocket.on('dilemmaVotingStarted', (data: { dilemmaId: string; dilemma: Dilemma; currentPlayerId: string }) => {
      console.log('🗳️ Dilemma voting phase started (discussion ended):', data.dilemmaId);
      setDilemmaDiscussionPhase(null);
      setPendingDilemmaVote(data);
      setDilemmaVoteStatus({
        hasVoted: false,
        myOptionIndex: null,
        totalVotes: 0,
        requiredVotes: 0,
      });
    });

    newSocket.on('dilemmaVoteUpdate', (data: { dilemmaId: string; totalVotes: number; requiredVotes: number }) => {
      console.log(`📊 Dilemma vote update: ${data.totalVotes}/${data.requiredVotes}`);
      setDilemmaVoteStatus(prev => prev ? {
        ...prev,
        totalVotes: data.totalVotes,
        requiredVotes: data.requiredVotes,
      } : null);
    });

    newSocket.on('dilemmaVotingComplete', (data: { dilemmaId: string; dilemma: Dilemma; currentPlayerId: string; winningOption: DilemmaOption; winningOptionIndex: number; result: DilemmaVoteResult }) => {
      console.log('✅ Client received dilemmaVotingComplete:', {
        dilemmaId: data.dilemmaId,
        winningOptionIndex: data.winningOptionIndex,
        winningOptionText: data.winningOption.text,
      });
      setPendingDilemmaVote(null);
      setDilemmaVoteStatus(null);
      setDilemmaDiscussionPhase(null);
      // Il componente Game ascolta direttamente 'dilemmaVotingComplete' dal server
    });

    newSocket.on('playerActionReceived', () => {
      // Azione ricevuta, il master applicherà la logica
    });

    newSocket.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    newSocket.on('roomClosed', () => {
      setError('Room was closed by master');
      setRoomInfo(null);
      setGameState(null);
    });

    // Eventi di disconnessione/riconnessione giocatori
    newSocket.on('playerDisconnected', (data: { playerId: string; playerName: string; gracePeriodMs: number }) => {
      console.log(`⚠️ Player ${data.playerName} disconnected (grace period: ${data.gracePeriodMs / 1000}s)`);
    });

    newSocket.on('playerReconnected', (data: { playerId: string; playerName: string }) => {
      console.log(`✅ Player ${data.playerName} reconnected`);
    });

    newSocket.on('playerPermanentlyLeft', (data: { playerId: string; playerName: string }) => {
      console.log(`❌ Player ${data.playerName} permanently left the game`);
    });

    newSocket.on('playerJoinedMidGame', (data: { playerId: string; playerName: string; playerColor: string; playerIcon: string }) => {
      console.log(`🆕 Player ${data.playerName} joined mid-game`);
    });

    // Master connection status events
    newSocket.on('masterConnectionLost', (data: { message: string }) => {
      console.warn(`💔 ${data.message}`);
      setMasterConnected(false);
    });

    newSocket.on('masterReconnected', (data: { message: string }) => {
      console.log(`💚 ${data.message}`);
      setMasterConnected(true);
    });

    newSocket.on('gameStarted', () => {
      // Aggiorna roomInfo per riflettere che il gioco è iniziato
      setRoomInfo(prev => {
        if (prev) {
          return {
            ...prev,
            isGameStarted: true,
          };
        }
        return null;
      });
    });

    // Cleanup: NON chiudere il socket, solo rimuovi i listener se necessario
    // Il socket deve rimanere connesso per tutta la durata dell'app
    return () => {
      // Cancella eventuali timeout di riconnessione in corso
      if (reconnectAttemptRef.current) {
        clearTimeout(reconnectAttemptRef.current);
        reconnectAttemptRef.current = null;
      }
      // Non fare nulla - il socket rimane connesso
      // Se vogliamo chiudere, dovremmo farlo solo quando l'app si chiude completamente
    };
  }, []); // Connetti solo una volta al mount del componente
  
  // Quando roomId cambia e il socket è connesso, richiedi le informazioni della room
  // NON fare joinRoom qui - lascia che PlayerGame lo gestisca quando necessario
  useEffect(() => {
    if (roomId && socket?.connected) {
      socket.emit('requestRoomInfo', { roomId });
    }
  }, [roomId, socket]);

  // Master heartbeat: invia un segnale periodico al server per confermare che il master è vivo
  useEffect(() => {
    if (isMasterRef.current && socket?.connected && roomId) {
      // Avvia il heartbeat
      heartbeatIntervalRef.current = window.setInterval(() => {
        if (socket?.connected && roomId) {
          socket.emit('masterHeartbeat', { roomId });
        }
      }, MASTER_HEARTBEAT_INTERVAL_MS);

      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      };
    }
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [socket, roomId, roomInfo?.masterSocketId]);

  const createRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('createRoom');
  }, [socket]);

  const joinRoom = useCallback((playerName: string, playerColor: string, playerIcon?: string) => {
    if (!socket) return;
    // Usa roomId dallo stato o dal parametro
    const targetRoomId = roomId || (socket as any).currentRoomId;
    if (!targetRoomId) {
      console.error('No roomId available for joinRoom');
      return;
    }
    socket.emit('joinRoom', { roomId: targetRoomId, playerName, playerColor: playerColor, playerIcon });
  }, [socket, roomId]);

  const startGame = useCallback(() => {
    if (!socket) return;
    const targetRoomId = roomId || roomInfo?.roomId;
    if (!targetRoomId) return;
    socket.emit('startGame', { roomId: targetRoomId });
  }, [socket, roomId, roomInfo]);

  const sendAction = useCallback((action: string, data: any) => {
    if (!socket || !roomId) return;
    socket.emit('playerAction', { roomId, action, data });
  }, [socket, roomId]);

  const sendVote = useCallback((technologyId: string, vote: boolean) => {
    if (!socket || !roomId) {
      console.error('Cannot send vote: socket or roomId missing');
      return;
    }
    console.log(`📤 Sending vote: technologyId=${technologyId}, vote=${vote}, roomId=${roomId}`);
    
    // Aggiorna immediatamente lo stato locale per disabilitare i pulsanti
    setVoteStatus(prev => prev ? {
      ...prev,
      hasVoted: true,
      myVote: vote,
    } : null);
    
    socket.emit('vote', { roomId, technologyId, vote });
  }, [socket, roomId]);

  const sendReadyToVote = useCallback((technologyId: string) => {
    if (!socket || !roomId) {
      console.error('Cannot send readyToVote: socket or roomId missing');
      return;
    }
    console.log(`📤 Sending readyToVote: technologyId=${technologyId}, roomId=${roomId}`);
    
    // Update local state immediately
    setDiscussionPhase(prev => prev ? {
      ...prev,
      isReady: true,
    } : null);
    
    socket.emit('readyToVote', { roomId, technologyId });
  }, [socket, roomId]);

  const sendDilemmaVote = useCallback((dilemmaId: string, optionIndex: number) => {
    if (!socket || !roomId) {
      console.error('Cannot send dilemma vote: socket or roomId missing');
      return;
    }
    console.log(`📤 Sending dilemma vote: dilemmaId=${dilemmaId}, optionIndex=${optionIndex}, roomId=${roomId}`);
    
    // Aggiorna immediatamente lo stato locale
    setDilemmaVoteStatus(prev => prev ? {
      ...prev,
      hasVoted: true,
      myOptionIndex: optionIndex,
    } : null);
    
    socket.emit('dilemmaVote', { roomId, dilemmaId, optionIndex });
  }, [socket, roomId]);

  const sendDilemmaReadyToVote = useCallback((dilemmaId: string) => {
    if (!socket || !roomId) {
      console.error('Cannot send dilemmaReadyToVote: socket or roomId missing');
      return;
    }
    console.log(`📤 Sending dilemmaReadyToVote: dilemmaId=${dilemmaId}, roomId=${roomId}`);
    
    // Update local state immediately
    setDilemmaDiscussionPhase(prev => prev ? {
      ...prev,
      isReady: true,
    } : null);
    
    socket.emit('dilemmaReadyToVote', { roomId, dilemmaId });
  }, [socket, roomId]);

  const updateGameStateOnServer = useCallback((gameState: GameState) => {
    if (!roomId || !socket) {
      console.error('Cannot update game state: roomId or socket missing', { roomId: !!roomId, socket: !!socket });
      return;
    }
    
    console.log(`📤 Sending game state to server via WebSocket:`, {
      roomId,
      socketId: socket.id,
      playersCount: gameState.players.length,
    });
    
    // Usa socket emit con ack (più affidabile di HTTP POST)
    socket.emit('updateGameState', { roomId, gameState }, (response: { success: boolean; error?: string }) => {
      if (response?.success) {
        console.log('✅ Game state successfully sent to server via WebSocket');
      } else {
        console.error('❌ Failed to update game state via WebSocket:', response?.error);
        // Fallback: riprova dopo 1 secondo
        setTimeout(() => {
          if (socket?.connected && roomId) {
            console.log('🔄 Retrying game state update...');
            socket.emit('updateGameState', { roomId, gameState }, (retryResponse: { success: boolean; error?: string }) => {
              if (retryResponse?.success) {
                console.log('✅ Game state retry succeeded');
              } else {
                console.error('❌ Game state retry failed:', retryResponse?.error);
              }
            });
          }
        }, 1000);
      }
    });
  }, [roomId, socket]);

  const setGameStateWithSync = useCallback((newState: GameState) => {
    // IMPORTANTE: Imposta sempre il gameState localmente PRIMA di inviarlo al server
    // Questo evita il ritardo tra invio e ricezione
    setGameState(newState);
    
    // Se siamo in multiplayer e abbiamo un socket e roomId, invia sempre il gameState al server
    // Il server verificherà se siamo effettivamente il master e aggiornerà il masterSocketId se necessario
    // Questo gestisce anche il caso in cui il master si è riconnesso e il socket ID non corrisponde
    if (roomId && socket) {
      // Verifica se siamo il master (socket ID corrisponde) O se non siamo un giocatore (potremmo essere il master)
      const isMasterPlayer = roomInfo?.masterSocketId === socket.id;
      const isNotAPlayer = !roomInfo?.players.some(p => p.id === `player-${socket.id}`);
      
      // Se siamo il master o non siamo un giocatore (quindi potremmo essere il master riconnesso), invia il gameState
      if (isMasterPlayer || isNotAPlayer) {
        console.log('👑 Sending game state to server...', {
          isMasterPlayer,
          isNotAPlayer,
          socketId: socket.id,
          masterSocketId: roomInfo?.masterSocketId,
        });
        updateGameStateOnServer(newState);
      }
    }
  }, [roomId, roomInfo, socket, updateGameStateOnServer]);

  return {
    socket,
    gameState,
    playerState,
    isConnected,
    masterConnected,
    roomInfo,
    pendingVote,
    voteStatus,
    discussionPhase,
    pendingDilemmaVote,
    dilemmaVoteStatus,
    dilemmaDiscussionPhase,
    error,
    createRoom,
    joinRoom,
    startGame,
    sendAction,
    sendVote,
    sendReadyToVote,
    sendDilemmaVote,
    sendDilemmaReadyToVote,
    setGameState: setGameStateWithSync,
  };
}

