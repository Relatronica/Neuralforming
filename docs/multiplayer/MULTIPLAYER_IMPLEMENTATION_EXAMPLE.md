# Esempio Implementazione Multiplayer

Questo documento mostra esempi concreti di come implementare il multiplayer.

## 1. Server Structure

```typescript
// server/src/GameServer.ts
import { Server as SocketServer } from 'socket.io';
import { GameEngine, GameState } from '../shared/game/GameEngine';
import { PlayerState } from '../shared/game/types';

interface GameRoom {
  id: string;
  gameState: GameState;
  players: Map<string, { socketId: string; playerId: string }>;
  pendingVotes: Map<string, Map<string, boolean>>; // technologyId -> playerId -> vote
}

export class GameServer {
  private rooms: Map<string, GameRoom> = new Map();
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('createRoom', () => {
        const roomId = this.createRoom();
        socket.join(roomId);
        socket.emit('roomCreated', { roomId });
      });

      socket.on('joinRoom', ({ roomId, playerName, playerColor }) => {
        this.joinRoom(roomId, socket.id, playerName, playerColor);
        socket.join(roomId);
        socket.emit('joinedRoom', { roomId });
        this.broadcastGameState(roomId);
      });

      socket.on('playerAction', ({ roomId, action, data }) => {
        this.handlePlayerAction(roomId, socket.id, action, data);
      });

      socket.on('vote', ({ roomId, technologyId, vote }) => {
        this.handleVote(roomId, socket.id, technologyId, vote);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
      });
    });
  }

  private createRoom(): string {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const gameState = GameEngine.initializeGame();
    
    this.rooms.set(roomId, {
      id: roomId,
      gameState,
      players: new Map(),
      pendingVotes: new Map(),
    });

    return roomId;
  }

  private joinRoom(roomId: string, socketId: string, playerName: string, playerColor: string) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    // Trova il primo slot AI disponibile e sostituiscilo
    const aiPlayerIndex = room.gameState.players.findIndex(p => p.isAI);
    if (aiPlayerIndex === -1) {
      throw new Error('Room is full');
    }

    const newPlayer: PlayerState = {
      id: `player-${socketId}`,
      name: playerName,
      isAI: false,
      techPoints: 0,
      ethicsPoints: 0,
      neuralformingPoints: 0,
      technologies: [],
      hand: room.gameState.players[aiPlayerIndex].hand, // Mantieni le carte
      unlockedMilestones: [],
    };

    room.gameState.players[aiPlayerIndex] = newPlayer;
    room.players.set(socketId, { socketId, playerId: newPlayer.id });

    this.broadcastGameState(roomId);
  }

  private handlePlayerAction(roomId: string, socketId: string, action: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerInfo = room.players.get(socketId);
    if (!playerInfo) return;

    const player = room.gameState.players.find(p => p.id === playerInfo.playerId);
    if (!player || player.id !== room.gameState.currentPlayerId) {
      return; // Non è il turno di questo giocatore
    }

    let newState: GameState;

    switch (action) {
      case 'drawTechnology':
        newState = GameEngine.drawTechnology(room.gameState, player.id);
        break;

      case 'addTechnology':
        newState = GameEngine.addTechnology(room.gameState, player.id, data.technology);
        // Avvia votazione se necessario
        if (newState.lastVoteResult) {
          this.startVoting(roomId, data.technology.id);
        }
        break;

      case 'resolveDilemma':
        newState = GameEngine.resolveDilemma(room.gameState, player.id, data.option);
        break;

      case 'completeConsequence':
        newState = GameEngine.completeConsequencePhase(room.gameState);
        break;

      default:
        return;
    }

    room.gameState = newState;
    this.broadcastGameState(roomId);
  }

  private startVoting(roomId: string, technologyId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.pendingVotes.set(technologyId, new Map());
    
    // Notifica tutti i giocatori che devono votare
    this.io.to(roomId).emit('votingStarted', {
      technologyId,
      technology: room.gameState.players
        .flatMap(p => p.technologies)
        .find(t => t.id === technologyId),
    });
  }

  private handleVote(roomId: string, socketId: string, technologyId: string, vote: boolean) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerInfo = room.players.get(socketId);
    if (!playerInfo) return;

    const votes = room.pendingVotes.get(technologyId);
    if (!votes) return;

    votes.set(playerInfo.playerId, vote);

    // Controlla se tutti hanno votato
    const allPlayers = room.gameState.players.filter(p => !p.isAI);
    if (votes.size === allPlayers.length) {
      this.completeVoting(roomId, technologyId, votes);
    }
  }

  private completeVoting(roomId: string, technologyId: string, votes: Map<string, boolean>) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Converti voti in formato per ParliamentVoting
    // (modificare conductParliamentVote per accettare voti reali)
    
    room.pendingVotes.delete(technologyId);
    this.broadcastGameState(roomId);
  }

  private broadcastGameState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Invia stato completo al master
    this.io.to(roomId).emit('gameStateUpdate', {
      gameState: room.gameState,
    });

    // Invia stato parziale a ogni giocatore (solo le sue carte)
    room.players.forEach(({ socketId, playerId }) => {
      const player = room.gameState.players.find(p => p.id === playerId);
      if (player) {
        this.io.to(socketId).emit('playerStateUpdate', {
          playerState: {
            ...player,
            hand: player.hand, // Solo questo giocatore vede la sua mano
          },
        });
      }
    });
  }

  private handleDisconnect(socketId: string) {
    // Trova la room e rimuovi il giocatore
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.players.has(socketId)) {
        // Opzione: sostituisci con AI o rimuovi
        const playerInfo = room.players.get(socketId)!;
        // ... gestisci disconnessione
        room.players.delete(socketId);
        this.broadcastGameState(roomId);
        break;
      }
    }
  }
}
```

## 2. Client WebSocket Hook

```typescript
// src/hooks/useGameSocket.ts
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, PlayerState } from '../game/types';

export function useGameSocket(roomId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('joinRoom', { roomId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('gameStateUpdate', (data: { gameState: GameState }) => {
      setGameState(data.gameState);
    });

    newSocket.on('playerStateUpdate', (data: { playerState: PlayerState }) => {
      setPlayerState(data.playerState);
    });

    newSocket.on('votingStarted', (data: any) => {
      // Gestisci inizio votazione
      console.log('Voting started:', data);
    });

    return () => {
      newSocket.close();
    };
  }, [roomId]);

  const sendAction = useCallback((action: string, data: any) => {
    if (!socket || !roomId) return;
    socket.emit('playerAction', { roomId, action, data });
  }, [socket, roomId]);

  const sendVote = useCallback((technologyId: string, vote: boolean) => {
    if (!socket || !roomId) return;
    socket.emit('vote', { roomId, technologyId, vote });
  }, [socket, roomId]);

  return {
    socket,
    gameState,
    playerState,
    isConnected,
    sendAction,
    sendVote,
  };
}
```

## 3. Modifiche a Game.tsx (Master Screen)

```typescript
// src/components/Game/Game.tsx (semplificato)
import { useGameSocket } from '../../hooks/useGameSocket';
import { useState } from 'react';

export const Game: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const { gameState, isConnected, sendAction } = useGameSocket(roomId);

  // Crea partita
  const handleCreateRoom = () => {
    // ... logica creazione room
  };

  // Invece di chiamare direttamente GameEngine:
  const handleAddTechnology = (technology: Technology) => {
    sendAction('addTechnology', { technology });
  };

  const handleResolveDilemma = (option: DilemmaOption) => {
    sendAction('resolveDilemma', { option });
  };

  // ... resto del componente usa gameState dal server
};
```

## 4. Mobile App Component (PWA)

```typescript
// src/components/Mobile/PlayerApp.tsx
import { useGameSocket } from '../../hooks/useGameSocket';
import { useState } from 'react';

export const PlayerApp: React.FC<{ roomId: string; playerId: string }> = ({ roomId, playerId }) => {
  const { playerState, gameState, sendAction, sendVote } = useGameSocket(roomId);
  const [currentVote, setCurrentVote] = useState<string | null>(null);

  if (!playerState) {
    return <div>Caricamento...</div>;
  }

  const isMyTurn = gameState?.currentPlayerId === playerId;

  return (
    <div className="mobile-app">
      {/* Setup iniziale */}
      {!playerState.name && (
        <PlayerSetup onSetup={(name, color) => {
          // Invia setup al server
        }} />
      )}

      {/* Turno del giocatore */}
      {isMyTurn && gameState?.currentPhase === 'development' && (
        <div>
          <h2>Le tue proposte</h2>
          {playerState.hand.map(tech => (
            <button key={tech.id} onClick={() => {
              sendAction('addTechnology', { technology: tech });
            }}>
              {tech.name}
            </button>
          ))}
        </div>
      )}

      {/* Votazione */}
      {currentVote && (
        <div>
          <h2>Vota sulla proposta</h2>
          <button onClick={() => sendVote(currentVote, true)}>Sì</button>
          <button onClick={() => sendVote(currentVote, false)}>No</button>
        </div>
      )}

      {/* Dilemma */}
      {isMyTurn && gameState?.currentPhase === 'dilemma' && gameState.currentDilemma && (
        <DilemmaCard
          dilemma={gameState.currentDilemma}
          onSelectOption={(option) => {
            sendAction('resolveDilemma', { option });
          }}
        />
      )}
    </div>
  );
};
```

## 5. Modifiche a ParliamentVoting.ts

```typescript
// src/game/ParliamentVoting.ts (modificato)
export function conductParliamentVote(
  allPlayers: PlayerState[],
  proposerId: string,
  technology: Technology,
  realVotes?: Map<string, boolean> // Nuovo parametro opzionale
): VoteResult {
  const proposer = allPlayers.find(p => p.id === proposerId);
  if (!proposer) {
    throw new Error(`Proposer ${proposerId} not found`);
  }

  // Se ci sono voti reali, usali
  if (realVotes) {
    const supporters: string[] = [proposerId];
    const opponents: string[] = [];

    realVotes.forEach((vote, playerId) => {
      if (playerId !== proposerId) {
        if (vote) {
          supporters.push(playerId);
        } else {
          opponents.push(playerId);
        }
      }
    });

    const votesFor = supporters.length;
    const votesAgainst = opponents.length;
    const totalVotes = allPlayers.length;
    const approvalRate = votesFor / totalVotes;

    return {
      votesFor,
      votesAgainst,
      approvalRate,
      supporters,
      opponents,
    };
  }

  // Altrimenti usa la logica AI originale (per single-player)
  // ... codice esistente ...
}
```

## 6. Package.json - Dipendenze Aggiuntive

```json
{
  "dependencies": {
    // ... esistenti ...
    "socket.io-client": "^4.5.4"
  },
  "devDependencies": {
    // ... esistenti ...
  }
}
```

## 7. Server package.json

```json
{
  "name": "neuralforming-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.5.4",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.0",
    "tsx": "^3.12.7",
    "typescript": "^5.2.2"
  }
}
```

---

## Note Implementative

1. **Condivisione Codice**: La logica di gioco (`GameEngine`, `types`, ecc.) può essere condivisa tra client e server usando un package condiviso o copiando i file.

2. **Sicurezza**: Tutte le validazioni devono essere sul server. Il client invia solo intenzioni, il server valida e applica.

3. **Error Handling**: Gestisci sempre errori di connessione, timeout, e stati inconsistenti.

4. **Testing**: Testa con più dispositivi sulla stessa rete locale prima di deployare online.

