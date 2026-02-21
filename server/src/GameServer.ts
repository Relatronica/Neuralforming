import { Server as SocketServer, Socket } from 'socket.io';
import { GameState, PlayerState, Technology, DilemmaOption, Dilemma, VoteResult, DilemmaVoteResult } from './types.js';

interface PlayerConnection {
  socketId: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  playerIcon?: string;
  isMaster: boolean;
}

interface PendingVote {
  technologyId: string;
  technology: Technology;
  proposerId: string;
  votes: Map<string, boolean>; // playerId -> vote (true/false)
  startTime: number;
  // Discussion phase
  isDiscussionPhase: boolean;
  discussionEndTime: number; // timestamp when discussion ends
  readyPlayers: Set<string>; // playerIds who are ready to vote
  discussionTimer?: NodeJS.Timeout; // timer to auto-end discussion
}

const DISCUSSION_DURATION_MS = 90000; // 90 seconds discussion timer

interface PendingDilemmaVote {
  dilemmaId: string;
  dilemma: Dilemma;
  currentPlayerId: string; // Il giocatore il cui turno è attivo (riceve i punti)
  votes: Map<string, number>; // playerId -> optionIndex
  startTime: number;
  // Discussion phase
  isDiscussionPhase: boolean;
  discussionEndTime: number;
  readyPlayers: Set<string>;
  discussionTimer?: NodeJS.Timeout;
}

const DILEMMA_DISCUSSION_DURATION_MS = 60000; // 60 seconds discussion timer for dilemmas

// ===== COSTANTI DI CONFIGURAZIONE =====
const GRACE_PERIOD_MS = 60000; // 60 secondi per riconnessione giocatore
const ROOM_INACTIVE_TTL_MS = 30 * 60 * 1000; // 30 minuti di inattività prima di eliminare la room
const ROOM_GAMEOVER_TTL_MS = 5 * 60 * 1000; // 5 minuti dopo game over prima di eliminare la room
const ROOM_CLEANUP_INTERVAL_MS = 60 * 1000; // Controlla ogni 60 secondi
const DEFAULT_MAX_PLAYERS = 5;
const MIN_PLAYERS = 2;
const MAX_PLAYERS_LIMIT = 8; // Limite massimo assoluto

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 1000; // Finestra di 1 secondo
const RATE_LIMIT_MAX_ACTIONS = 5; // Max 5 azioni per finestra

// Master heartbeat
const MASTER_HEARTBEAT_INTERVAL_MS = 10000; // Il master invia un heartbeat ogni 10s
const MASTER_HEARTBEAT_TIMEOUT_MS = 30000; // Dopo 30s senza heartbeat, notifica i giocatori

interface DisconnectedPlayer {
  playerId: string;
  playerName: string;
  playerColor: string;
  playerIcon?: string;
  disconnectedAt: number;
  timeoutId?: NodeJS.Timeout;
}

interface OpeningStoryData {
  id: string;
  title: string;
  content: string;
  mood: string;
}

interface GameRoom {
  id: string;
  gameState: GameState | null;
  players: Map<string, PlayerConnection>; // socketId -> connection (NON include il master)
  masterSocketId: string; // Socket ID del master (non è un giocatore)
  pendingVotes: Map<string, PendingVote>; // technologyId -> pending vote
  pendingDilemmaVotes: Map<string, PendingDilemmaVote>; // dilemmaId -> pending dilemma vote
  isGameStarted: boolean;
  maxPlayers: number;
  disconnectedPlayers: Map<string, DisconnectedPlayer>; // playerId -> disconnected player info
  playerIdMap: Map<string, string>; // playerName -> playerId persistente
  // Opening story
  openingStory: OpeningStoryData | null;
  openingStoryReadyPlayers: Set<string>;
  openingStoryTimer?: NodeJS.Timeout;
  // Nuovi campi per cleanup e heartbeat
  createdAt: number;
  lastActivity: number;
  lastMasterHeartbeat: number;
  masterHeartbeatTimer?: NodeJS.Timeout;
}

// Rate limiter per socket
interface RateLimitEntry {
  timestamps: number[];
}

/**
 * Server centrale per gestire le partite multiplayer
 */
export class GameServer {
  private rooms: Map<string, GameRoom> = new Map();
  private io: SocketServer;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private rateLimitMap: Map<string, RateLimitEntry> = new Map(); // socketId -> rate limit

  constructor(io: SocketServer) {
    this.io = io;
    this.setupSocketHandlers();
    this.startCleanupInterval();
  }

  /**
   * Avvia il cleanup periodico delle room inattive/terminate
   */
  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleRooms();
    }, ROOM_CLEANUP_INTERVAL_MS);
    console.log(`🧹 Room cleanup interval started (every ${ROOM_CLEANUP_INTERVAL_MS / 1000}s)`);
  }

  /**
   * Pulisce le room scadute: inattive o terminate
   */
  private cleanupStaleRooms() {
    const now = Date.now();
    const roomsToDelete: string[] = [];

    for (const [roomId, room] of this.rooms.entries()) {
      // 1) Room con game over da più di ROOM_GAMEOVER_TTL_MS
      if (room.gameState?.currentPhase === 'gameOver') {
        const timeSinceActivity = now - room.lastActivity;
        if (timeSinceActivity > ROOM_GAMEOVER_TTL_MS) {
          console.log(`🧹 Cleaning up finished game room ${roomId} (inactive for ${Math.round(timeSinceActivity / 1000)}s)`);
          roomsToDelete.push(roomId);
          continue;
        }
      }

      // 2) Room inattive da più di ROOM_INACTIVE_TTL_MS (nessun giocatore connesso e nessun master)
      const hasConnectedPlayers = room.players.size > 0;
      const masterSocket = this.io.sockets.sockets.get(room.masterSocketId);
      const hasMaster = masterSocket?.connected ?? false;

      if (!hasConnectedPlayers && !hasMaster) {
        const timeSinceActivity = now - room.lastActivity;
        if (timeSinceActivity > ROOM_INACTIVE_TTL_MS) {
          console.log(`🧹 Cleaning up abandoned room ${roomId} (inactive for ${Math.round(timeSinceActivity / 1000)}s)`);
          roomsToDelete.push(roomId);
          continue;
        }
      }

      // 3) Room non iniziate da più di ROOM_INACTIVE_TTL_MS
      if (!room.isGameStarted) {
        const timeSinceCreation = now - room.createdAt;
        if (timeSinceCreation > ROOM_INACTIVE_TTL_MS && !hasConnectedPlayers) {
          console.log(`🧹 Cleaning up old unstarted room ${roomId} (created ${Math.round(timeSinceCreation / 1000)}s ago)`);
          roomsToDelete.push(roomId);
        }
      }
    }

    for (const roomId of roomsToDelete) {
      this.destroyRoom(roomId);
    }

    if (roomsToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${roomsToDelete.length} rooms. Active rooms: ${this.rooms.size}`);
    }
  }

  /**
   * Distrugge una room, pulendo tutti i timer e notificando i client
   */
  private destroyRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Pulisci tutti i timeout di disconnectedPlayers
    room.disconnectedPlayers.forEach((disconnected) => {
      if (disconnected.timeoutId) {
        clearTimeout(disconnected.timeoutId);
      }
    });

    // Pulisci tutti i timer delle votazioni
    room.pendingVotes.forEach((vote) => {
      if (vote.discussionTimer) {
        clearTimeout(vote.discussionTimer);
      }
    });
    room.pendingDilemmaVotes.forEach((vote) => {
      if (vote.discussionTimer) {
        clearTimeout(vote.discussionTimer);
      }
    });

    // Pulisci il timer della opening story
    if (room.openingStoryTimer) {
      clearTimeout(room.openingStoryTimer);
    }

    // Pulisci il master heartbeat timer
    if (room.masterHeartbeatTimer) {
      clearTimeout(room.masterHeartbeatTimer);
    }

    // Notifica tutti i client nella room
    this.io.to(roomId).emit('roomClosed', { reason: 'Room expired due to inactivity' });

    this.rooms.delete(roomId);
  }

  /**
   * Aggiorna il timestamp di ultima attività di una room
   */
  private touchRoom(room: GameRoom) {
    room.lastActivity = Date.now();
  }

  /**
   * Rate limiter: verifica se un socket può eseguire un'azione
   */
  private checkRateLimit(socketId: string): boolean {
    const now = Date.now();
    let entry = this.rateLimitMap.get(socketId);

    if (!entry) {
      entry = { timestamps: [] };
      this.rateLimitMap.set(socketId, entry);
    }

    // Rimuovi timestamps fuori dalla finestra
    entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

    if (entry.timestamps.length >= RATE_LIMIT_MAX_ACTIONS) {
      return false; // Rate limited
    }

    entry.timestamps.push(now);
    return true;
  }

  /**
   * Pulisce le entry di rate limiting per socket disconnessi
   */
  private cleanupRateLimit(socketId: string) {
    this.rateLimitMap.delete(socketId);
  }

  /**
   * Avvia il monitoraggio heartbeat del master per una room
   */
  private startMasterHeartbeatMonitor(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Pulisci timer precedente se esiste
    if (room.masterHeartbeatTimer) {
      clearTimeout(room.masterHeartbeatTimer);
    }

    room.lastMasterHeartbeat = Date.now();

    room.masterHeartbeatTimer = setInterval(() => {
      const now = Date.now();
      const timeSinceHeartbeat = now - room.lastMasterHeartbeat;

      if (timeSinceHeartbeat > MASTER_HEARTBEAT_TIMEOUT_MS) {
        // Master potenzialmente disconnesso - verifica socket
        const masterSocket = this.io.sockets.sockets.get(room.masterSocketId);
        if (!masterSocket || !masterSocket.connected) {
          console.log(`💔 Master heartbeat timeout for room ${roomId} (${Math.round(timeSinceHeartbeat / 1000)}s)`);
          // Notifica i giocatori
          this.io.to(roomId).emit('masterConnectionLost', {
            message: 'Il tabellone di gioco si è disconnesso. In attesa di riconnessione...',
            lastHeartbeat: room.lastMasterHeartbeat,
            timeoutMs: MASTER_HEARTBEAT_TIMEOUT_MS,
          });
        }
      }
    }, MASTER_HEARTBEAT_INTERVAL_MS) as unknown as NodeJS.Timeout;
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      socket.on('createRoom', ({ playerName, playerColor, maxPlayers }: { playerName?: string; playerColor?: string; maxPlayers?: number } = {}) => {
        const roomId = this.createRoom(socket.id, playerName, playerColor, maxPlayers);
        socket.join(roomId);
        socket.emit('roomCreated', { roomId });
        this.broadcastRoomUpdate(roomId);
      });

      // Gestisce la riconnessione del master
      socket.on('reconnectAsMaster', ({ roomId }: { roomId: string }) => {
        const room = this.rooms.get(roomId);
        if (room) {
          // Verifica che il vecchio masterSocketId sia ancora valido (il socket è disconnesso)
          // Se il vecchio masterSocketId non è più nella room, significa che il master si è riconnesso
          const oldMasterSocket = this.io.sockets.sockets.get(room.masterSocketId);
          if (!oldMasterSocket || !oldMasterSocket.connected) {
            // Il vecchio socket non è più connesso, aggiorna il masterSocketId
            console.log(`🔄 Master reconnected: updating masterSocketId from ${room.masterSocketId} to ${socket.id}`);
            room.masterSocketId = socket.id;
            room.lastMasterHeartbeat = Date.now();
            this.touchRoom(room);
            socket.join(roomId);
            this.broadcastRoomUpdate(roomId);
            // Se c'è un gameState, invialo subito al master riconnesso
            if (room.gameState) {
              socket.emit('gameStateUpdate', { gameState: room.gameState });
            }
            // Notifica i giocatori che il master è tornato
            this.io.to(roomId).emit('masterReconnected', {
              message: 'Il tabellone di gioco si è riconnesso.',
            });
          } else {
            console.warn(`⚠️ ReconnectAsMaster rejected: old master socket ${room.masterSocketId} is still connected`);
          }
        }
      });

      // ===== Master Heartbeat =====
      socket.on('masterHeartbeat', ({ roomId }: { roomId: string }) => {
        const room = this.rooms.get(roomId);
        if (room && room.masterSocketId === socket.id) {
          room.lastMasterHeartbeat = Date.now();
          this.touchRoom(room);
        }
      });

      // ===== Game State via Socket (sostituisce HTTP POST) =====
      socket.on('updateGameState', ({ roomId, gameState }: { roomId: string; gameState: GameState }, ack?: (response: { success: boolean; error?: string }) => void) => {
        try {
          const room = this.rooms.get(roomId);
          if (!room) {
            ack?.({ success: false, error: 'Room not found' });
            return;
          }
          this.updateGameState(roomId, gameState, socket.id);
          ack?.({ success: true });
        } catch (error: any) {
          console.error(`❌ Error updating game state via socket:`, error.message);
          ack?.({ success: false, error: error.message });
        }
      });

      // ===== Start Voting via Socket (sostituisce HTTP POST) =====
      socket.on('startVoting', ({ roomId, technologyId, technology, proposerId }: { roomId: string; technologyId: string; technology: Technology; proposerId: string }, ack?: (response: { success: boolean; error?: string }) => void) => {
        try {
          const room = this.rooms.get(roomId);
          if (!room) {
            ack?.({ success: false, error: 'Room not found' });
            return;
          }
          this.touchRoom(room);
          this.startVotingForTechnology(roomId, technologyId, technology, proposerId);
          ack?.({ success: true });
        } catch (error: any) {
          console.error(`❌ Error starting voting via socket:`, error.message);
          ack?.({ success: false, error: error.message });
        }
      });

      // ===== Start Dilemma Voting via Socket (sostituisce HTTP POST) =====
      socket.on('startDilemmaVoting', ({ roomId, dilemmaId, dilemma, currentPlayerId }: { roomId: string; dilemmaId: string; dilemma: Dilemma; currentPlayerId: string }, ack?: (response: { success: boolean; error?: string }) => void) => {
        try {
          const room = this.rooms.get(roomId);
          if (!room) {
            ack?.({ success: false, error: 'Room not found' });
            return;
          }
          this.touchRoom(room);
          this.startDilemmaVotingForRoom(roomId, dilemmaId, dilemma, currentPlayerId);
          ack?.({ success: true });
        } catch (error: any) {
          console.error(`❌ Error starting dilemma voting via socket:`, error.message);
          ack?.({ success: false, error: error.message });
        }
      });

      socket.on('joinRoom', async ({ roomId, playerName, playerColor, playerIcon }: { roomId: string; playerName: string; playerColor: string; playerIcon?: string }) => {
        // Validazione: assicurati che playerName non sia vuoto o uguale a roomId
        if (!playerName || !playerName.trim() || playerName.trim() === roomId) {
          const errorMsg = !playerName || !playerName.trim() 
            ? 'Player name is required' 
            : 'Player name cannot be the same as room ID';
          socket.emit('joinedRoom', { roomId, success: false, error: errorMsg });
          return;
        }
        
        try {
          const trimmedName = playerName.trim();
          this.joinRoom(roomId, socket.id, trimmedName, playerColor, playerIcon);
          await socket.join(roomId);
          
          socket.emit('joinedRoom', { roomId, success: true });
          this.broadcastRoomUpdate(roomId);
        } catch (error: any) {
          socket.emit('joinedRoom', { roomId, success: false, error: error.message });
          console.error(`Failed to join room ${roomId}:`, error.message);
        }
      });

      socket.on('requestRoomInfo', ({ roomId }: { roomId: string }) => {
        const room = this.rooms.get(roomId);
        if (room) {
          this.broadcastRoomUpdate(roomId);
        } else {
          socket.emit('error', { message: 'Room not found' });
        }
      });

      socket.on('startGame', async ({ roomId }: { roomId: string }) => {
        try {
          await this.startGame(roomId, socket.id);
        } catch (error: any) {
          console.error(`Error starting game:`, error);
          socket.emit('error', { message: error.message });
        }
      });

      // ===== Opening Story =====
      socket.on('openingStory', ({ roomId, story }: { roomId: string; story: OpeningStoryData }) => {
        const room = this.rooms.get(roomId);
        if (!room || room.masterSocketId !== socket.id) return;

        room.openingStory = story;
        room.openingStoryReadyPlayers = new Set();
        this.touchRoom(room);

        // Auto-complete after 60s if not all ready
        if (room.openingStoryTimer) clearTimeout(room.openingStoryTimer);
        room.openingStoryTimer = setTimeout(() => {
          this.completeOpeningStory(roomId);
        }, 60000);

        // Broadcast to all players (not master, it already has the story)
        room.players.forEach((player) => {
          this.io.to(player.socketId).emit('openingStory', { story });
        });

        console.log(`📖 Opening story broadcast to room ${roomId}: "${story.title}"`);
      });

      socket.on('openingStoryReady', ({ roomId }: { roomId: string }) => {
        const room = this.rooms.get(roomId);
        if (!room || !room.openingStory) return;

        const player = room.players.get(socket.id);
        if (!player) return;

        room.openingStoryReadyPlayers.add(player.playerId);
        this.touchRoom(room);

        const readyCount = room.openingStoryReadyPlayers.size;
        const totalPlayers = room.players.size;

        console.log(`📖 Player ${player.playerName} ready (${readyCount}/${totalPlayers})`);

        this.io.to(roomId).emit('openingStoryUpdate', {
          readyCount,
          totalPlayers,
        });

        if (readyCount >= totalPlayers) {
          this.completeOpeningStory(roomId);
        }
      });

      socket.on('playerAction', ({ roomId, action, data }: { roomId: string; action: string; data: any }) => {
        // Rate limiting
        if (!this.checkRateLimit(socket.id)) {
          console.warn(`⚠️ Rate limited player action from ${socket.id}`);
          socket.emit('error', { message: 'Too many actions. Please slow down.' });
          return;
        }
        try {
          this.handlePlayerAction(roomId, socket.id, action, data);
        } catch (error: any) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('vote', ({ roomId, technologyId, vote }: { roomId: string; technologyId: string; vote: boolean }) => {
        if (!this.checkRateLimit(socket.id)) {
          console.warn(`⚠️ Rate limited vote from ${socket.id}`);
          return;
        }
        try {
          console.log(`📊 Received vote from ${socket.id} for technology ${technologyId}: ${vote}`);
          this.handleVote(roomId, socket.id, technologyId, vote);
        } catch (error: any) {
          console.error(`❌ Error handling vote from ${socket.id}:`, error.message);
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('readyToVote', ({ roomId, technologyId }: { roomId: string; technologyId: string }) => {
        try {
          console.log(`✋ Received readyToVote from ${socket.id} for technology ${technologyId}`);
          this.handleReadyToVote(roomId, socket.id, technologyId);
        } catch (error: any) {
          console.error(`❌ Error handling readyToVote from ${socket.id}:`, error.message);
          socket.emit('error', { message: error.message });
        }
      });

      // Dilemma voting events
      socket.on('dilemmaVote', ({ roomId, dilemmaId, optionIndex }: { roomId: string; dilemmaId: string; optionIndex: number }) => {
        if (!this.checkRateLimit(socket.id)) {
          console.warn(`⚠️ Rate limited dilemma vote from ${socket.id}`);
          return;
        }
        try {
          console.log(`🗳️ Received dilemma vote from ${socket.id} for dilemma ${dilemmaId}: option ${optionIndex}`);
          this.handleDilemmaVote(roomId, socket.id, dilemmaId, optionIndex);
        } catch (error: any) {
          console.error(`❌ Error handling dilemma vote from ${socket.id}:`, error.message);
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('dilemmaReadyToVote', ({ roomId, dilemmaId }: { roomId: string; dilemmaId: string }) => {
        if (!this.checkRateLimit(socket.id)) {
          return;
        }
        try {
          console.log(`✋ Received dilemmaReadyToVote from ${socket.id} for dilemma ${dilemmaId}`);
          this.handleDilemmaReadyToVote(roomId, socket.id, dilemmaId);
        } catch (error: any) {
          console.error(`❌ Error handling dilemmaReadyToVote from ${socket.id}:`, error.message);
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
        this.cleanupRateLimit(socket.id);
      });
    });
  }

  private createRoom(socketId: string, playerName?: string, playerColor?: string, maxPlayers?: number): string {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Valida e limita maxPlayers
    let validMaxPlayers = DEFAULT_MAX_PLAYERS;
    if (maxPlayers && typeof maxPlayers === 'number') {
      validMaxPlayers = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS_LIMIT, Math.floor(maxPlayers)));
    }

    const now = Date.now();
    const room: GameRoom = {
      id: roomId,
      gameState: null,
      players: new Map(), // I giocatori verranno aggiunti con joinRoom
      masterSocketId: socketId, // Il creatore è il master (non è un giocatore)
      pendingVotes: new Map(),
      pendingDilemmaVotes: new Map(),
      isGameStarted: false,
      maxPlayers: validMaxPlayers,
      disconnectedPlayers: new Map(), // Giocatori disconnessi temporaneamente
      playerIdMap: new Map(), // Mappa playerName -> playerId persistente
      openingStory: null,
      openingStoryReadyPlayers: new Set(),
      createdAt: now,
      lastActivity: now,
      lastMasterHeartbeat: now,
    };

    // Il master NON viene aggiunto come giocatore
    // Solo i giocatori che fanno join vengono aggiunti

    this.rooms.set(roomId, room);
    console.log(`🏠 Room ${roomId} created (maxPlayers: ${validMaxPlayers})`);

    // Avvia il monitoraggio heartbeat del master
    this.startMasterHeartbeatMonitor(roomId);

    return roomId;
  }

  /**
   * Genera o recupera un playerId persistente per un giocatore
   * Questo permette di mantenere lo stesso ID anche dopo riconnessione
   */
  private getOrCreatePlayerId(room: GameRoom, playerName: string): string {
    if (!room.playerIdMap.has(playerName)) {
      // Genera un nuovo ID persistente
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      room.playerIdMap.set(playerName, playerId);
      console.log(`🆕 Created persistent playerId for ${playerName}: ${playerId}`);
    }
    return room.playerIdMap.get(playerName)!;
  }

  private joinRoom(roomId: string, socketId: string, playerName: string, playerColor: string, playerIcon?: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    this.touchRoom(room);

    // ✅ NUOVO: Permetti riconnessione se il giocatore era disconnesso (anche durante partita)
    const disconnected = Array.from(room.disconnectedPlayers.values())
      .find(p => p.playerName === playerName);
    
    if (disconnected) {
      // Riconnessione: ripristina il giocatore
      console.log(`🔄 Player ${playerName} reconnecting (was disconnected at ${new Date(disconnected.disconnectedAt).toISOString()})...`);
      
      // Cancella il timeout di rimozione se presente
      if (disconnected.timeoutId) {
        clearTimeout(disconnected.timeoutId);
        console.log(`⏰ Cancelled removal timeout for ${playerName}`);
      }
      
      // Rimuovi da disconnectedPlayers
      room.disconnectedPlayers.delete(disconnected.playerId);
      
      // Ottieni o crea playerId persistente
      const persistentPlayerId = this.getOrCreatePlayerId(room, playerName);
      
      // Rimuovi eventuali entry vecchie con lo stesso nome ma socketId diverso
      const oldEntries = Array.from(room.players.entries()).filter(
        ([id, p]) => p.playerName === playerName && id !== socketId
      );
      oldEntries.forEach(([oldSocketId]) => {
        console.log(`🔄 Removing old socket entry ${oldSocketId} for player ${playerName} (reconnecting)`);
        room.players.delete(oldSocketId);
      });
      
      // Aggiungi di nuovo alla lista attiva con lo stesso playerId persistente
      room.players.set(socketId, {
        socketId,
        playerId: persistentPlayerId, // ✅ Mantieni lo stesso playerId
        playerName: disconnected.playerName,
        playerColor: disconnected.playerColor, // Mantieni colore originale
        playerIcon: disconnected.playerIcon || playerIcon || 'landmark',
        isMaster: false,
      });
      
      console.log(`✅ Player ${playerName} reconnected with persistent playerId ${persistentPlayerId}`);
      
      // Notifica la room che il giocatore si è riconnesso
      if (room.isGameStarted) {
        this.io.to(roomId).emit('playerReconnected', {
          playerId: persistentPlayerId,
          playerName: playerName,
        });
      }
      
      // Se il gioco è iniziato, invia lo stato del giocatore
      if (room.isGameStarted && room.gameState) {
        const playerState = room.gameState.players.find(p => p.id === persistentPlayerId);
        if (playerState) {
          // Invia lo stato del giocatore riconnesso
          this.io.to(socketId).emit('playerStateUpdate', {
            playerState: {
              ...playerState,
              hand: playerState.hand,
            },
            gameState: {
              ...room.gameState,
              players: room.gameState.players.map(p => ({
                ...p,
                hand: p.id === persistentPlayerId ? p.hand : [],
              })),
            },
          });
          console.log(`📤 Sent game state to reconnected player ${playerName}`);
        } else {
          console.warn(`⚠️ Player state not found in gameState for reconnected player ${playerName} (playerId: ${persistentPlayerId})`);
        }
        
        // Se ci sono votazioni in corso, inviale al giocatore riconnesso
        if (room.pendingVotes.size > 0) {
          room.pendingVotes.forEach((pendingVote, technologyId) => {
            console.log(`📊 Sending pending vote to reconnected player ${playerName}: ${technologyId}`);
            
            if (pendingVote.isDiscussionPhase) {
              // Still in discussion phase - send discussion info
              this.io.to(socketId).emit('discussionStarted', {
                technologyId: pendingVote.technologyId,
                technology: pendingVote.technology,
                proposerId: pendingVote.proposerId,
                discussionEndTime: pendingVote.discussionEndTime,
                discussionDurationMs: DISCUSSION_DURATION_MS,
              });
              // Also send discussion update with ready players
              const allVoters = Array.from(room.players.values()).filter(p => p.playerId !== pendingVote.proposerId);
              this.io.to(socketId).emit('discussionUpdate', {
                technologyId,
                readyPlayers: Array.from(pendingVote.readyPlayers),
                readyCount: pendingVote.readyPlayers.size,
                requiredCount: allVoters.length,
              });
            } else {
              // Discussion ended, voting in progress
              this.io.to(socketId).emit('votingStarted', {
                technologyId: pendingVote.technologyId,
                technology: pendingVote.technology,
                proposerId: pendingVote.proposerId,
              });
            }
            
            // Invia anche lo stato della votazione
            const allPlayers = Array.from(room.players.values()).filter(p => p.playerId !== pendingVote.proposerId);
            const votesCount = pendingVote.votes.size;
            const myVote = pendingVote.votes.has(persistentPlayerId);
            
            this.io.to(socketId).emit('voteUpdate', {
              technologyId,
              votes: Array.from(pendingVote.votes.entries()).map(([pid, v]) => ({ playerId: pid, vote: v })),
              totalVotes: votesCount,
              requiredVotes: allPlayers.length,
            });
            
            console.log(`📊 Sent vote status to reconnected player ${playerName}: ${votesCount}/${allPlayers.length} votes, hasVoted: ${myVote}`);
          });
        }
        
        // Se ci sono votazioni dilemma in corso, inviale al giocatore riconnesso
        if (room.pendingDilemmaVotes.size > 0) {
          room.pendingDilemmaVotes.forEach((pendingDilemmaVote, dilemmaId) => {
            console.log(`📊 Sending pending dilemma vote to reconnected player ${playerName}: ${dilemmaId}`);
            
            if (pendingDilemmaVote.isDiscussionPhase) {
              this.io.to(socketId).emit('dilemmaDiscussionStarted', {
                dilemmaId: pendingDilemmaVote.dilemmaId,
                dilemma: pendingDilemmaVote.dilemma,
                currentPlayerId: pendingDilemmaVote.currentPlayerId,
                discussionEndTime: pendingDilemmaVote.discussionEndTime,
                discussionDurationMs: DILEMMA_DISCUSSION_DURATION_MS,
              });
              const allPlayers = Array.from(room.players.values());
              this.io.to(socketId).emit('dilemmaDiscussionUpdate', {
                dilemmaId,
                readyPlayers: Array.from(pendingDilemmaVote.readyPlayers),
                readyCount: pendingDilemmaVote.readyPlayers.size,
                requiredCount: allPlayers.length,
              });
            } else {
              this.io.to(socketId).emit('dilemmaVotingStarted', {
                dilemmaId: pendingDilemmaVote.dilemmaId,
                dilemma: pendingDilemmaVote.dilemma,
                currentPlayerId: pendingDilemmaVote.currentPlayerId,
              });
            }
            
            const allPlayers = Array.from(room.players.values());
            this.io.to(socketId).emit('dilemmaVoteUpdate', {
              dilemmaId,
              totalVotes: pendingDilemmaVote.votes.size,
              requiredVotes: allPlayers.length,
            });
          });
        }
      }
      
      this.broadcastRoomUpdate(roomId);
      return; // ✅ Riconnessione completata
    }

    // Se il giocatore è già nella room con questo socketId, aggiorna solo le info (riconnessione)
    if (room.players.has(socketId)) {
      const existingPlayer = room.players.get(socketId)!;
      // Aggiorna le informazioni del giocatore (potrebbero essere cambiate)
      existingPlayer.playerName = playerName;
      existingPlayer.playerColor = playerColor;
      existingPlayer.playerIcon = playerIcon || 'landmark';
      console.log(`✅ Player ${playerName} reconnected with same socketId ${socketId}`);
      return; // Già presente, non fare altro
    }

    // Verifica se c'è spazio nella room (conta anche i disconnessi temporanei)
    const totalPlayers = room.players.size + room.disconnectedPlayers.size;
    if (totalPlayers >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    // Verifica che il nome non sia già usato da UN ALTRO giocatore (connesso o disconnesso)
    const nameExistsInPlayers = Array.from(room.players.values()).some(
      p => p.playerName === playerName && p.socketId !== socketId
    );
    const nameExistsInDisconnected = Array.from(room.disconnectedPlayers.values()).some(
      p => p.playerName === playerName
    );
    if (nameExistsInPlayers || nameExistsInDisconnected) {
      throw new Error('Player name already taken');
    }

    // Nuovo giocatore: genera playerId persistente
    const persistentPlayerId = this.getOrCreatePlayerId(room, playerName);
    
    // Rimuovi eventuali entry vecchie con lo stesso nome ma socketId diverso (riconnessione)
    const oldEntries = Array.from(room.players.entries()).filter(
      ([id, p]) => p.playerName === playerName && id !== socketId
    );
    oldEntries.forEach(([oldSocketId]) => {
      console.log(`🔄 Removing old socket entry ${oldSocketId} for player ${playerName} (reconnecting)`);
      room.players.delete(oldSocketId);
    });

    // Aggiungi il nuovo giocatore con playerId persistente
    room.players.set(socketId, {
      socketId,
      playerId: persistentPlayerId,
      playerName,
      playerColor,
      playerIcon: playerIcon || 'landmark',
      isMaster: false,
    });
    
    console.log(`✅ Player ${playerName} joined room ${roomId} with socketId ${socketId} and persistent playerId ${persistentPlayerId}`);

    // Se il gioco è già iniziato, notifica il master per aggiungere il giocatore al gameState
    if (room.isGameStarted) {
      console.log(`🆕 Player ${playerName} joining mid-game, notifying master to add to game state`);
      this.io.to(roomId).emit('playerJoinedMidGame', {
        playerId: persistentPlayerId,
        playerName,
        playerColor,
        playerIcon: playerIcon || 'landmark',
      });
      
      // Invia lo stato corrente del gioco al nuovo giocatore (se disponibile)
      // Lo stato completo sarà inviato dopo che il master aggiorna il gameState
      if (room.gameState) {
        this.io.to(socketId).emit('playerStateUpdate', {
          playerState: {
            id: persistentPlayerId,
            name: playerName,
            isAI: false,
            techPoints: 0,
            ethicsPoints: 0,
            neuralformingPoints: 0,
            technologies: [],
            hand: [],
            unlockedMilestones: [],
            color: playerColor,
            icon: playerIcon || 'landmark',
          },
          gameState: {
            ...room.gameState,
            // Nascondi le mani degli altri giocatori
            players: room.gameState.players.map(p => ({
              ...p,
              hand: [],
            })),
          },
        });
      }
    }
  }

  private async startGame(roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verifica che sia il master a avviare il gioco
    if (room.masterSocketId !== socketId) {
      throw new Error('Only the master can start the game');
    }

    if (room.players.size < 2) {
      throw new Error('Need at least 2 players to start');
    }

    if (room.isGameStarted) {
      throw new Error('Game already started');
    }

    // Inizializza il gioco
    // Nota: Per ora il gameState viene inizializzato dal client master
    // In futuro possiamo spostare la logica qui per sicurezza
    room.isGameStarted = true;
    this.touchRoom(room);
    
    // Notifica tutti che il gioco è iniziato
    this.io.to(roomId).emit('gameStarted', { roomId });
    this.broadcastRoomUpdate(roomId);
  }

  private handlePlayerAction(roomId: string, socketId: string, action: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isGameStarted) {
      throw new Error('Game not started');
    }
    this.touchRoom(room);

    const player = room.players.get(socketId);
    if (!player) {
      throw new Error('Player not found in room');
    }

    // Verifica che sia il turno del giocatore (se c'è uno stato di gioco)
    if (room.gameState && room.gameState.currentPlayerId !== player.playerId) {
      throw new Error('Not your turn');
    }

    // Controllo specifico per addTechnology: verifica che la fase sia ancora 'development'
    // Questo impedisce di proporre più tecnologie nello stesso turno
    if (action === 'addTechnology' && room.gameState) {
      if (room.gameState.currentPhase !== 'development') {
        throw new Error('Cannot propose technology: not in development phase');
      }
    }

    // Invia l'azione al master (che applicherà la logica)
    // IMPORTANTE: Il master NON è un giocatore, è identificato da masterSocketId
    if (room.masterSocketId) {
      this.io.to(room.masterSocketId).emit('playerActionReceived', {
        playerId: player.playerId,
        action,
        data,
      });
    } else {
      console.error(`⚠️ Cannot send player action: masterSocketId not found for room ${roomId}`);
    }
  }

  public updateGameState(roomId: string, gameState: GameState, socketId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Cannot update game state: room ${roomId} not found`);
      return;
    }

    // Verifica che chi invia il gameState sia il master
    if (socketId) {
      // Se il socket ID corrisponde al masterSocketId, è il master (OK)
      if (socketId === room.masterSocketId) {
        console.log(`✅ Game state update from master (socketId: ${socketId})`);
      }
      // Se il gameState è null (primo invio) O il masterSocketId non è ancora impostato, accetta sempre
      // Questo gestisce il caso in cui il master si è riconnesso prima di inviare il primo gameState
      else if (!room.gameState || !room.masterSocketId) {
        console.log(`🆕 Accepting game state from socket ${socketId} (first game state or no masterSocketId set)`);
        // Se il masterSocketId non è impostato, impostalo
        if (!room.masterSocketId) {
          room.masterSocketId = socketId;
          console.log(`🆕 Set masterSocketId to ${socketId}`);
        }
        // Se il gameState è null ma il masterSocketId è impostato, aggiorna il masterSocketId
        // (questo gestisce il caso in cui il master si è riconnesso)
        else if (socketId !== room.masterSocketId) {
          const oldMasterSocket = this.io.sockets.sockets.get(room.masterSocketId);
          if (!oldMasterSocket || !oldMasterSocket.connected) {
            console.log(`🔄 Master reconnected: updating masterSocketId from ${room.masterSocketId} to ${socketId}`);
            room.masterSocketId = socketId;
          }
        }
      }
      // Se il socket ID non corrisponde E il gameState esiste già, verifica se è una riconnessione
      else {
        // Verifica se il vecchio master socket è ancora connesso
        const oldMasterSocket = this.io.sockets.sockets.get(room.masterSocketId);
        if (!oldMasterSocket || !oldMasterSocket.connected) {
          // Il vecchio master non è più connesso, aggiorna il masterSocketId (riconnessione)
          console.log(`🔄 Master reconnected via gameState update: updating masterSocketId from ${room.masterSocketId} to ${socketId}`);
          room.masterSocketId = socketId;
        } else {
          // Il vecchio master è ancora connesso, rifiuta l'aggiornamento
          console.warn(`⚠️ Game state update rejected: socketId ${socketId} does not match masterSocketId ${room.masterSocketId} and old master is still connected`);
          return;
        }
      }
    } else {
      // Se non viene fornito socketId, verifica che il masterSocketId sia già impostato
      // (per retrocompatibilità con richieste senza socketId)
      if (!room.masterSocketId) {
        console.warn(`⚠️ Game state update rejected: no socketId provided and no masterSocketId set`);
        return;
      }
    }

    console.log(`📥 Received game state update for room ${roomId}, players: ${gameState.players.length}`);
    room.gameState = gameState;
    this.touchRoom(room);
    this.broadcastGameState(roomId);
  }

  private handleVote(roomId: string, socketId: string, technologyId: string, vote: boolean) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isGameStarted) {
      throw new Error('Game not started');
    }
    this.touchRoom(room);

    const player = room.players.get(socketId);
    if (!player) {
      throw new Error('Player not found in room');
    }

    const pendingVote = room.pendingVotes.get(technologyId);
    if (!pendingVote) {
      // Se la votazione è già completata, ignora il voto
      return;
    }

    // Reject votes during discussion phase
    if (pendingVote.isDiscussionPhase) {
      console.log(`⚠️ Vote rejected: discussion phase still active for technology ${technologyId}`);
      return;
    }

    // Verifica se il giocatore ha già votato
    const hasVoted = pendingVote.votes.has(player.playerId);
    pendingVote.votes.set(player.playerId, vote);

    console.log(`✅ Vote registered for player ${player.playerName} (${player.playerId}): ${vote}`);
    console.log(`   Has voted before: ${hasVoted}`);
    console.log(`   Current votes: ${pendingVote.votes.size}`);

    // Controlla se tutti hanno votato
    // IMPORTANTE: conta solo i giocatori che devono votare (escluso il proponente)
    const allPlayers = Array.from(room.players.values()).filter(p => p.playerId !== pendingVote.proposerId);
    
    console.log(`   Total players (excluding proposer): ${allPlayers.length}`);
    console.log(`   Players: ${allPlayers.map(p => `${p.playerName} (${p.playerId})`).join(', ')}`);
    console.log(`   Votes: ${Array.from(pendingVote.votes.entries()).map(([pid, v]) => `${pid}: ${v}`).join(', ')}`);
    
    // Verifica che tutti i giocatori (escluso il proponente) abbiano votato
    const allVoted = allPlayers.every(p => pendingVote.votes.has(p.playerId));
    const votesCount = pendingVote.votes.size;
    
    console.log(`   All voted: ${allVoted}, Votes count: ${votesCount}, Required: ${allPlayers.length}`);
    
    if (allVoted && votesCount >= allPlayers.length) {
      console.log(`🎯 All players voted, completing voting...`);
      this.completeVoting(roomId, technologyId);
    } else {
      // Aggiorna lo stato della votazione per tutti
      console.log(`📢 Broadcasting vote update: ${votesCount}/${allPlayers.length} votes`);
      this.io.to(roomId).emit('voteUpdate', {
        technologyId,
        votes: Array.from(pendingVote.votes.entries()).map(([pid, v]) => ({ playerId: pid, vote: v })),
        totalVotes: votesCount,
        requiredVotes: allPlayers.length,
      });
    }
  }

  private completeVoting(roomId: string, technologyId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const pendingVote = room.pendingVotes.get(technologyId);
    if (!pendingVote) return;

    // Invia il risultato della votazione con tecnologia e proposerId
    this.io.to(roomId).emit('votingComplete', {
      technologyId,
      technology: pendingVote.technology,
      proposerId: pendingVote.proposerId,
      votes: Array.from(pendingVote.votes.entries()).map(([pid, v]) => ({ playerId: pid, vote: v })),
    });

    room.pendingVotes.delete(technologyId);
  }

  private startVoting(roomId: string, technologyId: string, technology: Technology, proposerId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`❌ Cannot start voting: room ${roomId} not found`);
      return;
    }

    console.log(`📊 Starting discussion phase for room ${roomId}:`, {
      technologyId,
      technologyName: technology.name,
      proposerId,
      playersInRoom: Array.from(room.players.values()).map(p => ({ id: p.playerId, name: p.playerName })),
      gameStatePlayers: room.gameState?.players.map(p => ({ id: p.id, name: p.name })) || [],
    });

    // Verifica che il proposerId corrisponda a un giocatore nella room
    const proposer = Array.from(room.players.values()).find(p => p.playerId === proposerId);
    if (!proposer) {
      console.error(`❌ Cannot start voting: proposer ${proposerId} not found in room`, {
        proposerId,
        availablePlayers: Array.from(room.players.values()).map(p => p.playerId),
      });
      return;
    }

    const discussionEndTime = Date.now() + DISCUSSION_DURATION_MS;

    const pendingVote: PendingVote = {
      technologyId,
      technology,
      proposerId,
      votes: new Map(),
      startTime: Date.now(),
      isDiscussionPhase: true,
      discussionEndTime,
      readyPlayers: new Set(),
    };

    // Set server-side timer to auto-end discussion
    pendingVote.discussionTimer = setTimeout(() => {
      this.endDiscussionPhase(roomId, technologyId);
    }, DISCUSSION_DURATION_MS);

    room.pendingVotes.set(technologyId, pendingVote);

    console.log(`📢 Emitting discussionStarted to room ${roomId}`, {
      technologyId,
      proposerId,
      proposerName: proposer.playerName,
      discussionEndTime,
      durationSeconds: DISCUSSION_DURATION_MS / 1000,
    });

    // Emit discussion phase start (not voting yet)
    this.io.to(roomId).emit('discussionStarted', {
      technologyId,
      technology,
      proposerId,
      discussionEndTime,
      discussionDurationMs: DISCUSSION_DURATION_MS,
    });
  }

  private handleReadyToVote(roomId: string, socketId: string, technologyId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isGameStarted) {
      throw new Error('Game not started');
    }

    const player = room.players.get(socketId);
    if (!player) {
      throw new Error('Player not found in room');
    }

    const pendingVote = room.pendingVotes.get(technologyId);
    if (!pendingVote || !pendingVote.isDiscussionPhase) {
      // Discussion already ended or vote not found
      return;
    }

    // Proposer doesn't need to mark ready
    if (player.playerId === pendingVote.proposerId) {
      return;
    }

    pendingVote.readyPlayers.add(player.playerId);

    console.log(`✋ Player ${player.playerName} (${player.playerId}) is ready to vote`);

    // Count non-proposer players
    const allVoters = Array.from(room.players.values()).filter(p => p.playerId !== pendingVote.proposerId);
    const readyCount = pendingVote.readyPlayers.size;
    const requiredCount = allVoters.length;

    console.log(`   Ready: ${readyCount}/${requiredCount}`);

    // Broadcast discussion update to all
    this.io.to(roomId).emit('discussionUpdate', {
      technologyId,
      readyPlayers: Array.from(pendingVote.readyPlayers),
      readyCount,
      requiredCount,
    });

    // If all non-proposer players are ready, end discussion immediately
    if (readyCount >= requiredCount) {
      console.log(`🎯 All players ready, ending discussion phase early`);
      this.endDiscussionPhase(roomId, technologyId);
    }
  }

  private endDiscussionPhase(roomId: string, technologyId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const pendingVote = room.pendingVotes.get(technologyId);
    if (!pendingVote || !pendingVote.isDiscussionPhase) {
      // Already ended
      return;
    }

    // Clear the auto-end timer if it's still running
    if (pendingVote.discussionTimer) {
      clearTimeout(pendingVote.discussionTimer);
      pendingVote.discussionTimer = undefined;
    }

    pendingVote.isDiscussionPhase = false;

    console.log(`📢 Discussion phase ended for room ${roomId}, emitting votingStarted`);

    // Now emit votingStarted to unlock voting buttons
    this.io.to(roomId).emit('votingStarted', {
      technologyId: pendingVote.technologyId,
      technology: pendingVote.technology,
      proposerId: pendingVote.proposerId,
    });
  }

  // ========================
  // Dilemma Voting Methods
  // ========================

  private startDilemmaVoting(roomId: string, dilemmaId: string, dilemma: Dilemma, currentPlayerId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`❌ Cannot start dilemma voting: room ${roomId} not found`);
      return;
    }

    console.log(`📊 Starting dilemma discussion phase for room ${roomId}:`, {
      dilemmaId,
      dilemmaTitle: dilemma.title,
      currentPlayerId,
      optionsCount: dilemma.options.length,
      playersInRoom: Array.from(room.players.values()).map(p => ({ id: p.playerId, name: p.playerName })),
    });

    const discussionEndTime = Date.now() + DILEMMA_DISCUSSION_DURATION_MS;

    const pendingDilemmaVote: PendingDilemmaVote = {
      dilemmaId,
      dilemma,
      currentPlayerId,
      votes: new Map(),
      startTime: Date.now(),
      isDiscussionPhase: true,
      discussionEndTime,
      readyPlayers: new Set(),
    };

    // Set server-side timer to auto-end discussion
    pendingDilemmaVote.discussionTimer = setTimeout(() => {
      this.endDilemmaDiscussionPhase(roomId, dilemmaId);
    }, DILEMMA_DISCUSSION_DURATION_MS);

    room.pendingDilemmaVotes.set(dilemmaId, pendingDilemmaVote);

    console.log(`📢 Emitting dilemmaDiscussionStarted to room ${roomId}`);

    // Emit discussion phase start to ALL players (including master)
    this.io.to(roomId).emit('dilemmaDiscussionStarted', {
      dilemmaId,
      dilemma,
      currentPlayerId,
      discussionEndTime,
      discussionDurationMs: DILEMMA_DISCUSSION_DURATION_MS,
    });
  }

  private handleDilemmaVote(roomId: string, socketId: string, dilemmaId: string, optionIndex: number) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isGameStarted) {
      throw new Error('Game not started');
    }
    this.touchRoom(room);

    const player = room.players.get(socketId);
    if (!player) {
      throw new Error('Player not found in room');
    }

    const pendingVote = room.pendingDilemmaVotes.get(dilemmaId);
    if (!pendingVote) {
      return; // Voting already completed
    }

    // Reject votes during discussion phase
    if (pendingVote.isDiscussionPhase) {
      console.log(`⚠️ Dilemma vote rejected: discussion phase still active for dilemma ${dilemmaId}`);
      return;
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= pendingVote.dilemma.options.length) {
      console.log(`⚠️ Invalid option index ${optionIndex} for dilemma with ${pendingVote.dilemma.options.length} options`);
      return;
    }

    pendingVote.votes.set(player.playerId, optionIndex);

    console.log(`✅ Dilemma vote registered for player ${player.playerName} (${player.playerId}): option ${optionIndex}`);
    console.log(`   Current votes: ${pendingVote.votes.size}`);

    // Check if all players have voted (ALL players vote, not just non-current)
    const allPlayers = Array.from(room.players.values());
    const allVoted = allPlayers.every(p => pendingVote.votes.has(p.playerId));
    const votesCount = pendingVote.votes.size;

    console.log(`   All voted: ${allVoted}, Votes count: ${votesCount}, Required: ${allPlayers.length}`);

    if (allVoted && votesCount >= allPlayers.length) {
      console.log(`🎯 All players voted on dilemma, completing voting...`);
      this.completeDilemmaVoting(roomId, dilemmaId);
    } else {
      // Broadcast vote update to all
      console.log(`📢 Broadcasting dilemma vote update: ${votesCount}/${allPlayers.length} votes`);
      this.io.to(roomId).emit('dilemmaVoteUpdate', {
        dilemmaId,
        totalVotes: votesCount,
        requiredVotes: allPlayers.length,
        // Don't reveal individual votes yet
      });
    }
  }

  private handleDilemmaReadyToVote(roomId: string, socketId: string, dilemmaId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isGameStarted) {
      throw new Error('Game not started');
    }

    const player = room.players.get(socketId);
    if (!player) {
      throw new Error('Player not found in room');
    }

    const pendingVote = room.pendingDilemmaVotes.get(dilemmaId);
    if (!pendingVote || !pendingVote.isDiscussionPhase) {
      return; // Discussion already ended
    }

    pendingVote.readyPlayers.add(player.playerId);

    console.log(`✋ Player ${player.playerName} (${player.playerId}) is ready to vote on dilemma`);

    // All players can vote
    const allPlayers = Array.from(room.players.values());
    const readyCount = pendingVote.readyPlayers.size;
    const requiredCount = allPlayers.length;

    console.log(`   Ready: ${readyCount}/${requiredCount}`);

    // Broadcast discussion update
    this.io.to(roomId).emit('dilemmaDiscussionUpdate', {
      dilemmaId,
      readyPlayers: Array.from(pendingVote.readyPlayers),
      readyCount,
      requiredCount,
    });

    // If all players are ready, end discussion immediately
    if (readyCount >= requiredCount) {
      console.log(`🎯 All players ready, ending dilemma discussion phase early`);
      this.endDilemmaDiscussionPhase(roomId, dilemmaId);
    }
  }

  private endDilemmaDiscussionPhase(roomId: string, dilemmaId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const pendingVote = room.pendingDilemmaVotes.get(dilemmaId);
    if (!pendingVote || !pendingVote.isDiscussionPhase) {
      return; // Already ended
    }

    // Clear the auto-end timer
    if (pendingVote.discussionTimer) {
      clearTimeout(pendingVote.discussionTimer);
      pendingVote.discussionTimer = undefined;
    }

    pendingVote.isDiscussionPhase = false;

    console.log(`📢 Dilemma discussion phase ended for room ${roomId}, emitting dilemmaVotingStarted`);

    // Emit votingStarted to unlock voting buttons
    this.io.to(roomId).emit('dilemmaVotingStarted', {
      dilemmaId: pendingVote.dilemmaId,
      dilemma: pendingVote.dilemma,
      currentPlayerId: pendingVote.currentPlayerId,
    });
  }

  private completeDilemmaVoting(roomId: string, dilemmaId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const pendingVote = room.pendingDilemmaVotes.get(dilemmaId);
    if (!pendingVote) return;

    // Count votes per option
    const votesPerOption = new Array(pendingVote.dilemma.options.length).fill(0);
    const voterChoices: Array<{ playerId: string; optionIndex: number }> = [];

    pendingVote.votes.forEach((optionIndex, playerId) => {
      votesPerOption[optionIndex]++;
      voterChoices.push({ playerId, optionIndex });
    });

    // Find winning option (highest votes; in case of tie, first option wins)
    let winningOptionIndex = 0;
    let maxVotes = 0;
    for (let i = 0; i < votesPerOption.length; i++) {
      if (votesPerOption[i] > maxVotes) {
        maxVotes = votesPerOption[i];
        winningOptionIndex = i;
      }
    }

    const winningOption = pendingVote.dilemma.options[winningOptionIndex];

    const result: DilemmaVoteResult = {
      optionIndex: winningOptionIndex,
      optionText: winningOption.text,
      votesPerOption,
      totalVotes: pendingVote.votes.size,
      voterChoices,
    };

    console.log(`🏆 Dilemma voting complete:`, {
      dilemmaId,
      dilemmaTitle: pendingVote.dilemma.title,
      votesPerOption,
      winningOptionIndex,
      winningOptionText: winningOption.text,
    });

    // Emit result to all
    this.io.to(roomId).emit('dilemmaVotingComplete', {
      dilemmaId,
      dilemma: pendingVote.dilemma,
      currentPlayerId: pendingVote.currentPlayerId,
      winningOption,
      winningOptionIndex,
      result,
    });

    room.pendingDilemmaVotes.delete(dilemmaId);
  }

  private completeOpeningStory(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.openingStory) return;

    if (room.openingStoryTimer) {
      clearTimeout(room.openingStoryTimer);
      room.openingStoryTimer = undefined;
    }

    console.log(`📖 Opening story complete for room ${roomId}`);
    this.io.to(roomId).emit('openingStoryComplete');
    room.openingStory = null;
    room.openingStoryReadyPlayers.clear();
  }

  public startDilemmaVotingForRoom(roomId: string, dilemmaId: string, dilemma: Dilemma, currentPlayerId: string) {
    this.startDilemmaVoting(roomId, dilemmaId, dilemma, currentPlayerId);
  }

  private broadcastRoomUpdate(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Escludi il master dalla lista dei giocatori (il master non è un giocatore)
    const players = Array.from(room.players.values())
      .filter(p => !p.isMaster) // Filtra eventuali master (per retrocompatibilità)
      .map(p => ({
        id: p.playerId,
        name: p.playerName,
        color: p.playerColor,
        icon: p.playerIcon || 'landmark',
        isMaster: false, // Nessun giocatore è master
      }));

    // Includi info sui giocatori disconnessi (per il master e gli altri giocatori)
    const disconnectedPlayers = Array.from(room.disconnectedPlayers.values()).map(dp => ({
      id: dp.playerId,
      name: dp.playerName,
      color: dp.playerColor,
      icon: dp.playerIcon || 'landmark',
      disconnectedAt: dp.disconnectedAt,
    }));

    this.io.to(roomId).emit('roomUpdate', {
      roomId,
      players,
      disconnectedPlayers,
      isGameStarted: room.isGameStarted,
      maxPlayers: room.maxPlayers,
      masterSocketId: room.masterSocketId, // Invia il socket ID del master
    });
  }

  private broadcastGameState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.gameState) {
      console.warn(`⚠️ Cannot broadcast game state: room ${roomId} not found or no game state`);
      return;
    }
    
    console.log(`📤 Broadcasting game state to room ${roomId}`);

    // Invia stato completo al master (il master non è nella lista dei giocatori)
    if (room.masterSocketId) {
      this.io.to(room.masterSocketId).emit('gameStateUpdate', {
        gameState: room.gameState,
      });
      console.log(`✅ Sent game state to master (${room.masterSocketId})`);
    }

    // Invia stato parziale a ogni giocatore (senza le carte degli altri)
    room.players.forEach((player) => {
      if (!player.isMaster && room.gameState) {
        const playerState = room.gameState.players.find(p => p.id === player.playerId);
        if (playerState) {
          this.io.to(player.socketId).emit('playerStateUpdate', {
            playerState: {
              ...playerState,
              hand: playerState.hand,
            },
            gameState: {
              ...room.gameState,
              players: room.gameState.players.map(p => ({
                ...p,
                hand: p.id === player.playerId ? p.hand : [],
              })),
            },
          });
        }
      }
    });
  }

  public startVotingForTechnology(roomId: string, technologyId: string, technology: Technology, proposerId: string) {
    this.startVoting(roomId, technologyId, technology, proposerId);
  }

  private handleDisconnect(socketId: string) {
    // Trova la room
    for (const [roomId, room] of this.rooms.entries()) {
      // Se è il master che si disconnette
      if (room.masterSocketId === socketId) {
        // Se il gioco non è iniziato, elimina la room
        if (!room.isGameStarted) {
          this.destroyRoom(roomId);
        } else {
          // Se il gioco è iniziato, logga ma non elimina la room (per permettere riconnessione)
          console.log(`⚠️ Master disconnected from room ${roomId} (game in progress)`);
          this.touchRoom(room);
          // Notifica i giocatori immediatamente
          this.io.to(roomId).emit('masterConnectionLost', {
            message: 'Il tabellone di gioco si è disconnesso. In attesa di riconnessione...',
            lastHeartbeat: room.lastMasterHeartbeat,
            timeoutMs: MASTER_HEARTBEAT_TIMEOUT_MS,
          });
        }
        break;
      } else if (room.players.has(socketId)) {
        // Giocatore normale si disconnette
        const player = room.players.get(socketId)!;
        
        // ✅ NUOVO: Grace period - non rimuovere immediatamente, aggiungi a disconnectedPlayers
        console.log(`⚠️ Player ${player.playerName} (${player.playerId}) disconnected from room ${roomId}`);
        
        // Aggiungi a disconnectedPlayers invece di rimuovere immediatamente
        const disconnected: DisconnectedPlayer = {
          playerId: player.playerId,
          playerName: player.playerName,
          playerColor: player.playerColor,
          playerIcon: player.playerIcon,
          disconnectedAt: Date.now(),
        };
        
        // Imposta timeout per rimozione dopo grace period
        const timeoutId = setTimeout(() => {
          if (room.disconnectedPlayers.has(player.playerId)) {
            console.log(`⏰ Grace period expired for player ${player.playerName} (${player.playerId}), removing from room`);
            room.disconnectedPlayers.delete(player.playerId);
            
            // Notifica che il giocatore ha lasciato permanentemente
            if (room.isGameStarted) {
              this.io.to(roomId).emit('playerPermanentlyLeft', {
                playerId: player.playerId,
                playerName: player.playerName,
              });
            }
            
            this.broadcastRoomUpdate(roomId);
          }
        }, GRACE_PERIOD_MS);
        
        disconnected.timeoutId = timeoutId;
        room.disconnectedPlayers.set(player.playerId, disconnected);
        
        // Rimuovi dalla lista attiva
        room.players.delete(socketId);
        
        console.log(`⏳ Player ${player.playerName} in grace period (${GRACE_PERIOD_MS / 1000}s) - can reconnect`);
        
        // Notifica la room che un giocatore si è disconnesso (utile per il master)
        if (room.isGameStarted) {
          this.io.to(roomId).emit('playerDisconnected', {
            playerId: player.playerId,
            playerName: player.playerName,
            gracePeriodMs: GRACE_PERIOD_MS,
          });
          
          // Verifica se ci sono votazioni in corso e se ora tutti i restanti hanno votato
          if (room.pendingVotes.size > 0) {
            room.pendingVotes.forEach((pendingVote, technologyId) => {
              if (!pendingVote.isDiscussionPhase) {
                // Controlla se tutti i giocatori connessi (escluso proponente) hanno votato
                const allVoters = Array.from(room.players.values()).filter(p => p.playerId !== pendingVote.proposerId);
                const allVoted = allVoters.every(p => pendingVote.votes.has(p.playerId));
                
                if (allVoted && allVoters.length > 0) {
                  console.log(`🎯 All remaining connected players voted after disconnect, completing voting for ${technologyId}`);
                  this.completeVoting(roomId, technologyId);
                } else {
                  // Aggiorna il conteggio voti per tutti
                  this.io.to(roomId).emit('voteUpdate', {
                    technologyId,
                    votes: Array.from(pendingVote.votes.entries()).map(([pid, v]) => ({ playerId: pid, vote: v })),
                    totalVotes: pendingVote.votes.size,
                    requiredVotes: allVoters.length,
                  });
                }
              } else {
                // In fase di discussione, verifica se tutti i restanti sono pronti
                const allVoters = Array.from(room.players.values()).filter(p => p.playerId !== pendingVote.proposerId);
                const readyCount = pendingVote.readyPlayers.size;
                
                if (readyCount >= allVoters.length && allVoters.length > 0) {
                  console.log(`🎯 All remaining connected players ready after disconnect, ending discussion for ${technologyId}`);
                  this.endDiscussionPhase(roomId, technologyId);
                } else {
                  // Aggiorna lo stato della discussione
                  this.io.to(roomId).emit('discussionUpdate', {
                    technologyId,
                    readyPlayers: Array.from(pendingVote.readyPlayers),
                    readyCount,
                    requiredCount: allVoters.length,
                  });
                }
              }
            });
          }
          
          // Verifica se ci sono votazioni dilemma in corso
          if (room.pendingDilemmaVotes.size > 0) {
            room.pendingDilemmaVotes.forEach((pendingDilemmaVote, dilemmaId) => {
              if (!pendingDilemmaVote.isDiscussionPhase) {
                // Controlla se tutti i giocatori connessi hanno votato
                const allPlayers = Array.from(room.players.values());
                const allVoted = allPlayers.every(p => pendingDilemmaVote.votes.has(p.playerId));
                
                if (allVoted && allPlayers.length > 0) {
                  console.log(`🎯 All remaining connected players voted on dilemma after disconnect, completing for ${dilemmaId}`);
                  this.completeDilemmaVoting(roomId, dilemmaId);
                } else {
                  this.io.to(roomId).emit('dilemmaVoteUpdate', {
                    dilemmaId,
                    totalVotes: pendingDilemmaVote.votes.size,
                    requiredVotes: allPlayers.length,
                  });
                }
              } else {
                // In fase di discussione dilemma
                const allPlayers = Array.from(room.players.values());
                const readyCount = pendingDilemmaVote.readyPlayers.size;
                
                if (readyCount >= allPlayers.length && allPlayers.length > 0) {
                  console.log(`🎯 All remaining connected players ready for dilemma after disconnect, ending discussion for ${dilemmaId}`);
                  this.endDilemmaDiscussionPhase(roomId, dilemmaId);
                } else {
                  this.io.to(roomId).emit('dilemmaDiscussionUpdate', {
                    dilemmaId,
                    readyPlayers: Array.from(pendingDilemmaVote.readyPlayers),
                    readyCount,
                    requiredCount: allPlayers.length,
                  });
                }
              }
            });
          }
        }
        
        this.broadcastRoomUpdate(roomId);
        break;
      }
    }
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Ritorna statistiche sulle room attive (per health check / debug)
   */
  public getStats(): { activeRooms: number; totalPlayers: number; roomDetails: Array<{ id: string; players: number; started: boolean; age: number }> } {
    const roomDetails: Array<{ id: string; players: number; started: boolean; age: number }> = [];
    let totalPlayers = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      const playerCount = room.players.size + room.disconnectedPlayers.size;
      totalPlayers += playerCount;
      roomDetails.push({
        id: roomId,
        players: playerCount,
        started: room.isGameStarted,
        age: Math.round((Date.now() - room.createdAt) / 1000),
      });
    }

    return {
      activeRooms: this.rooms.size,
      totalPlayers,
      roomDetails,
    };
  }

  /**
   * Shutdown pulito: pulisce tutti i timer e le room
   */
  public shutdown() {
    console.log('🛑 GameServer shutting down...');
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    for (const [roomId] of this.rooms.entries()) {
      this.destroyRoom(roomId);
    }
    this.rateLimitMap.clear();
    console.log('🛑 GameServer shutdown complete');
  }
}

