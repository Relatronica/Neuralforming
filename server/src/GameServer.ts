import { Server as SocketServer, Socket } from 'socket.io';
import { GameState, PlayerState, Technology, DilemmaOption, VoteResult } from './types.js';

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
}

interface GameRoom {
  id: string;
  gameState: GameState | null;
  players: Map<string, PlayerConnection>; // socketId -> connection (NON include il master)
  masterSocketId: string; // Socket ID del master (non è un giocatore)
  pendingVotes: Map<string, PendingVote>; // technologyId -> pending vote
  isGameStarted: boolean;
  maxPlayers: number;
}

/**
 * Server centrale per gestire le partite multiplayer
 */
export class GameServer {
  private rooms: Map<string, GameRoom> = new Map();
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      socket.on('createRoom', ({ playerName, playerColor }: { playerName?: string; playerColor?: string } = {}) => {
        const roomId = this.createRoom(socket.id, playerName, playerColor);
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
            socket.join(roomId);
            this.broadcastRoomUpdate(roomId);
            // Se c'è un gameState, invialo subito al master riconnesso
            if (room.gameState) {
              socket.emit('gameStateUpdate', { gameState: room.gameState });
            }
          } else {
            console.warn(`⚠️ ReconnectAsMaster rejected: old master socket ${room.masterSocketId} is still connected`);
          }
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

      socket.on('playerAction', ({ roomId, action, data }: { roomId: string; action: string; data: any }) => {
        try {
          this.handlePlayerAction(roomId, socket.id, action, data);
        } catch (error: any) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('vote', ({ roomId, technologyId, vote }: { roomId: string; technologyId: string; vote: boolean }) => {
        try {
          console.log(`📊 Received vote from ${socket.id} for technology ${technologyId}: ${vote}`);
          this.handleVote(roomId, socket.id, technologyId, vote);
        } catch (error: any) {
          console.error(`❌ Error handling vote from ${socket.id}:`, error.message);
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
      });
    });
  }

  private createRoom(socketId: string, playerName?: string, playerColor?: string): string {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const room: GameRoom = {
      id: roomId,
      gameState: null,
      players: new Map(), // I giocatori verranno aggiunti con joinRoom
      masterSocketId: socketId, // Il creatore è il master (non è un giocatore)
      pendingVotes: new Map(),
      isGameStarted: false,
      maxPlayers: 5,
    };

    // Il master NON viene aggiunto come giocatore
    // Solo i giocatori che fanno join vengono aggiunti

    this.rooms.set(roomId, room);
    return roomId;
  }

  private joinRoom(roomId: string, socketId: string, playerName: string, playerColor: string, playerIcon?: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.isGameStarted) {
      throw new Error('Game already started');
    }

    if (room.players.size >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    // Verifica che il nome non sia già usato
    const nameExists = Array.from(room.players.values()).some(p => p.playerName === playerName);
    if (nameExists) {
      throw new Error('Player name already taken');
    }

    room.players.set(socketId, {
      socketId,
      playerId: `player-${socketId}`,
      playerName,
      playerColor,
      playerIcon: playerIcon || 'landmark',
      isMaster: false,
    });
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
    
    // Notifica tutti che il gioco è iniziato
    this.io.to(roomId).emit('gameStarted', { roomId });
    this.broadcastRoomUpdate(roomId);
  }

  private handlePlayerAction(roomId: string, socketId: string, action: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isGameStarted) {
      throw new Error('Game not started');
    }

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
    this.broadcastGameState(roomId);
  }

  private handleVote(roomId: string, socketId: string, technologyId: string, vote: boolean) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isGameStarted) {
      throw new Error('Game not started');
    }

    const player = room.players.get(socketId);
    if (!player) {
      throw new Error('Player not found in room');
    }

    const pendingVote = room.pendingVotes.get(technologyId);
    if (!pendingVote) {
      // Se la votazione è già completata, ignora il voto
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

    console.log(`📊 Starting voting for room ${roomId}:`, {
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

    const pendingVote: PendingVote = {
      technologyId,
      technology,
      proposerId,
      votes: new Map(),
      startTime: Date.now(),
    };

    room.pendingVotes.set(technologyId, pendingVote);

    console.log(`📢 Emitting votingStarted to room ${roomId}`, {
      technologyId,
      proposerId,
      proposerName: proposer.playerName,
    });

    this.io.to(roomId).emit('votingStarted', {
      technologyId,
      technology,
      proposerId,
    });
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

    this.io.to(roomId).emit('roomUpdate', {
      roomId,
      players,
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
          this.rooms.delete(roomId);
          this.io.to(roomId).emit('roomClosed');
        } else {
          // Se il gioco è iniziato, logga ma non elimina la room (per permettere riconnessione)
          console.log(`Master disconnected from room ${roomId} (game in progress)`);
        }
        break;
      } else if (room.players.has(socketId)) {
        // Giocatore normale si disconnette
        room.players.delete(socketId);
        this.broadcastRoomUpdate(roomId);
        break;
      }
    }
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }
}

