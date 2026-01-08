import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, PlayerState } from '../game/types';

export interface RoomInfo {
  roomId: string;
  players: Array<{
    id: string;
    name: string;
    color: string;
    icon?: string;
    isMaster: boolean;
  }>;
  isGameStarted: boolean;
  maxPlayers: number;
  masterSocketId?: string; // Socket ID del master (per identificare il master)
}

export function useGameSocket(roomId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
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
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const isMasterRef = useRef<boolean>(false); // Traccia se siamo il master (abbiamo creato la room)
  const reconnectAttemptRef = useRef<number | null>(null); // Traccia il timeout per evitare richieste ripetute

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
      console.log('✅ Socket connected, attempting to restore session...');
      
      // Se abbiamo un roomId quando il socket si connette, richiedi le informazioni della room
      if (roomId) {
        newSocket.emit('requestRoomInfo', { roomId });
        
        // Prova a riconnettersi automaticamente se abbiamo credenziali salvate
        // Questo gestisce il caso di refresh o riconnessione dopo disconnessione
        try {
          const saved = localStorage.getItem('neuralforming_player_session');
          if (saved) {
            const session = JSON.parse(saved);
            // Se il roomId corrisponde e abbiamo un playerId, prova a riconnettersi
            if (session.roomId === roomId && session.playerId) {
              console.log('🔄 Auto-reconnecting with saved credentials...', {
                roomId: session.roomId,
                playerId: session.playerId,
              });
              
              // Aspetta un po' per assicurarsi che la room sia pronta
              setTimeout(() => {
                if (newSocket.connected) {
                  newSocket.emit('joinRoom', {
                    roomId: session.roomId,
                    playerName: session.playerId,
                    playerColor: session.playerColor || '#3B82F6',
                    playerIcon: session.playerIcon || 'landmark',
                  });
                  console.log('📤 Auto-reconnect joinRoom emitted');
                }
              }, 500);
            }
          }
        } catch (e) {
          console.error('❌ Failed to auto-reconnect:', e);
        }
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
        isGameStarted: false,
        maxPlayers: 5,
      });
    });

    newSocket.on('joinedRoom', (data: { roomId: string; success: boolean; error?: string }) => {
      if (!data.success) {
        setError(data.error || 'Failed to join room');
      } else {
        setError(null);
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
    });

    newSocket.on('votingStarted', (data: { technologyId: string; technology: any; proposerId: string }) => {
      setPendingVote(data);
      setVoteStatus({
        hasVoted: false,
        myVote: null,
        totalVotes: 0,
        requiredVotes: 0,
      });
    });

    newSocket.on('voteUpdate', (data: { technologyId: string; votes: Array<{ playerId: string; vote: boolean }>; totalVotes: number; requiredVotes: number }) => {
      // Aggiorna lo stato della votazione in corso
      // Il server usa player-${socketId} come playerId
      const currentSocketId = newSocket.id;
      const currentPlayerId = currentSocketId ? `player-${currentSocketId}` : null;
      const myVoteEntry = currentPlayerId ? data.votes.find(v => v.playerId === currentPlayerId) : null;
      
      console.log(`📊 Vote update received: currentPlayerId=${currentPlayerId}, myVote=${myVoteEntry?.vote ?? 'none'}, total=${data.totalVotes}/${data.requiredVotes}`);
      
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
      // NOTA: Il componente Game ascolta direttamente l'evento 'votingComplete' dal server
      // Non serve emettere un evento intermedio
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
  useEffect(() => {
    if (roomId && socket?.connected) {
      socket.emit('requestRoomInfo', { roomId });
      
      // Se abbiamo credenziali salvate per questo roomId, prova a riconnettersi
      try {
        const saved = localStorage.getItem('neuralforming_player_session');
        if (saved) {
          const session = JSON.parse(saved);
          if (session.roomId === roomId && session.playerId) {
            // Aspetta un po' e poi prova a riconnettersi
            setTimeout(() => {
              if (socket.connected) {
                socket.emit('joinRoom', {
                  roomId: session.roomId,
                  playerName: session.playerId,
                  playerColor: session.playerColor || '#3B82F6',
                  playerIcon: session.playerIcon || 'landmark',
                });
                console.log('📤 Reconnecting after roomId change');
              }
            }, 500);
          }
        }
      } catch (e) {
        console.error('❌ Failed to reconnect after roomId change:', e);
      }
    }
  }, [roomId, socket]);

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

  const updateGameStateOnServer = useCallback((gameState: GameState) => {
    if (!roomId || !socket) {
      console.error('Cannot update game state: roomId or socket missing', { roomId: !!roomId, socket: !!socket });
      return;
    }
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    // Invia anche il socket ID per gestire la riconnessione del master
    console.log(`📤 Sending game state to server via HTTP POST:`, {
      roomId,
      socketId: socket.id,
      playersCount: gameState.players.length,
    });
    fetch(`${serverUrl}/api/room/${roomId}/gamestate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameState,
        socketId: socket.id, // Invia il socket ID per aggiornare masterSocketId se necessario
      }),
    })
      .then(res => {
        if (!res.ok) {
          console.error('Failed to update game state on server:', res.status, res.statusText);
        } else {
          console.log('✅ Game state successfully sent to server');
        }
      })
      .catch(err => console.error('Failed to update game state on server:', err));
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
    roomInfo,
    pendingVote,
    voteStatus,
    error,
    createRoom,
    joinRoom,
    startGame,
    sendAction,
    sendVote,
    setGameState: setGameStateWithSync,
  };
}

