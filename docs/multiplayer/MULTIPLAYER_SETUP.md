# Setup Multiplayer - Neuralforming

## 🚀 Quick Start

### 1. Installare Dipendenze

```bash
# Client (root)
npm install

# Server
cd server
npm install
```

### 2. Avviare il Server

```bash
cd server
npm run dev
```

Il server sarà disponibile su `http://localhost:3001`

### 3. Avviare il Client

```bash
# Dalla root del progetto
npm run dev
```

Il client sarà disponibile su `http://localhost:5173`

## 📝 Configurazione

### Variabili d'Ambiente

Crea un file `.env` nella root del progetto:

```env
VITE_SERVER_URL=http://localhost:3001
```

Per il server, puoi configurare:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
```

## 🎮 Come Giocare

### Single Player
1. Apri `http://localhost:5173`
2. Clicca su "Gioca Single Player"
3. Il gioco funziona come prima con AI

### Multiplayer
1. **Master (chi crea la partita):**
   - Apri `http://localhost:5173`
   - Clicca su "Crea Partita"
   - Inserisci nome e colore del partito
   - Condividi l'ID della partita con gli altri giocatori

2. **Altri Giocatori:**
   - Apri `http://localhost:5173` sul loro dispositivo
   - Inserisci l'ID della partita
   - Inserisci nome e colore del partito
   - Clicca "Unisciti alla Partita"

3. **Inizio Partita:**
   - Il master clicca "Inizia Partita" quando ci sono almeno 2 giocatori

## 🔧 Architettura

```
Client (React + Vite)
  ├── src/
  │   ├── hooks/
  │   │   └── useGameSocket.ts      # Hook per WebSocket
  │   ├── components/
  │   │   └── Game/
  │   │       ├── Game.tsx          # Componente principale
  │   │       └── RoomSetup.tsx     # Setup partita multiplayer
  │   └── game/                      # Logica di gioco (condivisa)
  │
Server (Node.js + Express + Socket.io)
  ├── server/
  │   ├── src/
  │   │   ├── server.ts            # Entry point
  │   │   ├── GameServer.ts        # Gestione room e WebSocket
  │   │   └── types.ts             # Tipi TypeScript
```

## 📡 Eventi WebSocket

### Client → Server

- `createRoom` - Crea una nuova partita
- `joinRoom` - Unisciti a una partita esistente
- `startGame` - Inizia la partita (solo master)
- `playerAction` - Invia un'azione di gioco
- `vote` - Invia un voto su una proposta

### Server → Client

- `roomCreated` - Room creata con successo
- `joinedRoom` - Conferma join room
- `roomUpdate` - Aggiornamento lista giocatori
- `gameStateUpdate` - Aggiornamento stato gioco (master)
- `playerStateUpdate` - Aggiornamento stato giocatore
- `votingStarted` - Inizio votazione
- `voteUpdate` - Aggiornamento votazione in corso
- `votingComplete` - Votazione completata
- `playerActionReceived` - Azione ricevuta
- `error` - Errore
- `roomClosed` - Room chiusa

## 🐛 Troubleshooting

### Server non si avvia
- Verifica che la porta 3001 sia libera
- Controlla che tutte le dipendenze siano installate

### Client non si connette al server
- Verifica che il server sia in esecuzione
- Controlla `VITE_SERVER_URL` nel file `.env`
- Verifica CORS nel server

### Errori di compilazione TypeScript
- Esegui `npm run build` per vedere errori dettagliati
- Verifica che tutti i tipi siano corretti

## 🚧 Stato Implementazione

### ✅ Completato
- [x] Setup struttura server
- [x] GameServer con WebSocket
- [x] Hook useGameSocket
- [x] Componente RoomSetup
- [x] Modifiche a ParliamentVoting per voti reali
- [x] Integrazione base in App.tsx

### 🚧 In Lavoro
- [ ] Refactoring completo di Game.tsx per multiplayer
- [ ] Gestione votazioni real-time
- [ ] Sincronizzazione stato master → server → client
- [ ] App mobile (PWA)

### 📋 TODO
- [ ] Gestione disconnessioni
- [ ] Riconnessione automatica
- [ ] Validazione mosse sul server
- [ ] Logging e debugging
- [ ] Testing con più dispositivi

## 📚 Note Tecniche

### Sincronizzazione Stato

Attualmente, il master gestisce lo stato del gioco e lo invia al server. Il server lo distribuisce a tutti i client. In futuro, possiamo spostare la logica di gioco sul server per maggiore sicurezza.

### Votazioni

Quando un giocatore propone una tecnologia:
1. Il server avvia una votazione
2. Tutti i giocatori (tranne il proponente) ricevono la notifica
3. Ogni giocatore vota dal proprio dispositivo
4. Quando tutti hanno votato, il server completa la votazione
5. Il risultato viene applicato al gameState

### Sicurezza

Per ora, la validazione delle mosse è principalmente lato client. Per produzione, dovremmo:
- Validare tutte le mosse sul server
- Verificare che sia il turno del giocatore
- Prevenire modifiche non autorizzate allo stato

