import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { GameServer } from './GameServer';

const app = express();
const httpServer = createServer(app);

// Configura CORS per Socket.io
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configura CORS per Express
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Health check endpoint per Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inizializza il game server
const gameServer = new GameServer(io);

// Endpoint per ottenere info su una room (opzionale, per debug)
app.get('/api/room/:roomId', (req, res) => {
  const room = gameServer.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId: room.id,
    players: Array.from(room.players.values()).map(p => ({
      name: p.playerName,
      isMaster: p.isMaster,
    })),
    isGameStarted: room.isGameStarted,
  });
});

// Endpoint per aggiornare lo stato del gioco (chiamato dal master)
app.post('/api/room/:roomId/gamestate', express.json(), (req, res) => {
  const room = gameServer.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  // Il body può contenere { gameState, socketId } o solo gameState (per retrocompatibilità)
  const { gameState, socketId } = req.body;
  const actualGameState = gameState || req.body; // Se gameState non esiste, usa tutto il body
  
  gameServer.updateGameState(req.params.roomId, actualGameState, socketId);
  res.json({ success: true });
});

// Endpoint per avviare una votazione (chiamato dal master)
app.post('/api/room/:roomId/start-voting', express.json(), (req, res) => {
  const room = gameServer.getRoom(req.params.roomId);
  if (!room) {
    console.error(`❌ POST /api/room/${req.params.roomId}/start-voting: Room not found`);
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const { technologyId, technology, proposerId } = req.body;
  console.log(`📥 POST /api/room/${req.params.roomId}/start-voting:`, {
    technologyId,
    technologyName: technology?.name,
    proposerId,
  });
  
  gameServer.startVotingForTechnology(req.params.roomId, technologyId, technology, proposerId);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Neuralforming Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

