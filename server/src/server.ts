import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { GameServer } from './GameServer.js';

const app = express();
const httpServer = createServer(app);

// Normalizza CLIENT_URL rimuovendo il trailing slash
const normalizeOrigin = (url?: string): string => {
  if (!url) return 'http://localhost:5173';
  // Rimuovi trailing slash se presente
  return url.replace(/\/+$/, '');
};

const clientUrl = normalizeOrigin(process.env.CLIENT_URL);

// Configura CORS per Socket.io
const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Normalizza anche l'origine della richiesta
      const normalizedOrigin = origin ? normalizeOrigin(origin) : undefined;
      // Accetta se l'origine corrisponde (con o senza trailing slash)
      if (!normalizedOrigin || normalizedOrigin === clientUrl || origin === clientUrl || origin === `${clientUrl}/`) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configura CORS per Express
app.use(cors({
  origin: (origin, callback) => {
    // Se non c'è origine (richiesta same-origin o da server), accetta
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Normalizza sia l'origine della richiesta che CLIENT_URL
    const normalizedOrigin = normalizeOrigin(origin);
    
    // Accetta se l'origine corrisponde (con o senza trailing slash)
    if (normalizedOrigin === clientUrl || origin === clientUrl || origin === `${clientUrl}/`) {
      // Restituisci l'origine normalizzata (senza trailing slash) nell'header
      callback(null, normalizedOrigin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
  console.log(`🌐 CORS enabled for: ${clientUrl}`);
  console.log(`📝 Original CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

