# Analisi Fattibilità Multiplayer - Neuralforming

## ✅ Fattibilità: **ALTA**

Il gioco è ben strutturato per diventare multiplayer. La logica di gioco è già separata dalla UI e il sistema di votazione esiste già.

---

## 📋 Requisiti Tecnici

### 1. **Backend Server** (Nuovo)
- **WebSocket Server** (Socket.io o WebSocket nativo)
- **Game State Manager** - Mantiene lo stato centrale del gioco
- **Room Manager** - Gestisce le partite (creazione, join, disconnessioni)
- **Player Authentication** - Identifica i giocatori

**Stack suggerito:**
- Node.js + Express + Socket.io
- Oppure: Deno, Bun, o Python (FastAPI + WebSockets)

### 2. **Frontend Master** (Modifiche)
- Rimuovere gestione stato locale (`useState`)
- Connettere a WebSocket per ricevere aggiornamenti
- Inviare azioni al server invece di chiamare direttamente `GameEngine`
- Mostrare stato sincronizzato per tutti i giocatori

### 3. **App Mobile** (Nuovo)
- Interfaccia semplificata per smartphone
- Connessione WebSocket
- **Schermate principali:**
  - Setup: Scegli colore e nome partito
  - Hand: Vedi le tue carte
  - Proposta: Seleziona tecnologia da proporre
  - Votazione: Vota su proposte degli altri
  - Dilemma: Risolvi il dilemma quando è il tuo turno
  - Consequence: Vedi conseguenze

**Stack suggerito:**
- React Native (condividi logica con web)
- Oppure: PWA (Progressive Web App) - più semplice, funziona su mobile browser

---

## 🏗️ Architettura Proposta

```
┌─────────────────┐
│  Master Screen  │  (Web - Desktop/Tablet)
│  (React/Vite)   │
│  - Board view   │
│  - All players  │
│  - Game state   │
└────────┬────────┘
         │ WebSocket
         │
┌────────▼────────┐
│  Game Server    │  (Node.js + Socket.io)
│  - Game State   │
│  - Room Manager │
│  - Turn Logic   │
└────────┬────────┘
         │ WebSocket
         │
┌────────▼────────┐
│  Mobile Apps    │  (React Native o PWA)
│  - Player UI    │
│  - Actions      │
│  - Voting       │
└─────────────────┘
```

---

## 🔄 Flusso di Gioco Multiplayer

### Setup Partita
1. Master crea partita → Server genera `roomId`
2. Master mostra QR code con `roomId` e URL
3. Giocatori scansionano QR o inseriscono `roomId`
4. Ogni giocatore sceglie nome e colore partito
5. Quando tutti pronti → Inizia partita

### Durante il Gioco
1. **Turno Giocatore:**
   - Giocatore propone tecnologia dal suo smartphone
   - Server aggiorna stato → Tutti vedono proposta su master screen

2. **Votazione:**
   - Server invia proposta a tutti i giocatori
   - Ogni giocatore vota dal suo smartphone (Sì/No)
   - Server calcola risultato → Aggiorna master screen

3. **Dilemma:**
   - Quando è il turno di un giocatore, vede dilemma sul suo smartphone
   - Altri giocatori vedono "Giocatore X sta decidendo..."
   - Dopo scelta, tutti vedono conseguenza

---

## 📝 Modifiche al Codice Esistente

### 1. **GameEngine.ts** - Minime modifiche
- ✅ Già separato dalla UI
- ⚠️ Rimuovere logica AI (o mantenerla per partite single-player)
- ✅ `conductParliamentVote` va modificato per accettare voti reali invece di calcolarli

### 2. **ParliamentVoting.ts** - Modifiche necessarie
```typescript
// Attuale: calcola voti AI automaticamente
export function conductParliamentVote(...)

// Nuovo: accetta voti reali
export function conductParliamentVote(
  allPlayers: PlayerState[],
  proposerId: string,
  technology: Technology,
  realVotes: Map<string, boolean> // Voti reali dei giocatori
): VoteResult
```

### 3. **Game.tsx** - Refactoring significativo
- Rimuovere `useState` per gameState
- Aggiungere WebSocket client
- Sostituire chiamate dirette a `GameEngine` con messaggi al server
- Ricevere aggiornamenti di stato dal server

### 4. **Nuovo: Server/GameServer.ts**
```typescript
class GameServer {
  private rooms: Map<string, GameRoom> = new Map();
  
  createRoom(): string { ... }
  joinRoom(roomId: string, playerId: string): void { ... }
  handlePlayerAction(roomId: string, action: PlayerAction): void { ... }
  handleVote(roomId: string, playerId: string, vote: boolean): void { ... }
}
```

---

## 🎯 Vantaggi dell'Approccio

1. **Esperienza Sociale**: Giocare con amici reali è più coinvolgente
2. **Strategia Reale**: Le votazioni diventano negoziazioni reali
3. **Scalabilità**: Può supportare 2-5 giocatori facilmente
4. **Riutilizzo Codice**: La logica di gioco rimane la stessa

---

## ⚠️ Sfide e Considerazioni

### 1. **Sincronizzazione**
- **Problema**: Cosa succede se un giocatore si disconnette?
- **Soluzione**: Timeout per votazioni, possibilità di riconnessione

### 2. **Latency**
- **Problema**: Ritardi di rete possono rovinare l'esperienza
- **Soluzione**: Ottimistic updates + rollback se necessario

### 3. **Sicurezza**
- **Problema**: Prevenire cheating (modificare stato lato client)
- **Soluzione**: Tutta la logica critica sul server

### 4. **Mobile UX**
- **Problema**: Interfaccia deve essere semplice e veloce
- **Soluzione**: Design minimalista, solo azioni essenziali

---

## 🚀 Piano di Implementazione (Fasi)

### Fase 1: Backend Base (1-2 settimane)
- [ ] Setup server WebSocket
- [ ] Room management
- [ ] Sincronizzazione stato base

### Fase 2: Master Screen (1 settimana)
- [ ] Connessione WebSocket
- [ ] Rimozione stato locale
- [ ] Visualizzazione stato sincronizzato

### Fase 3: Mobile App Base (1-2 settimane)
- [ ] Setup app (PWA o React Native)
- [ ] Connessione WebSocket
- [ ] UI setup partita (nome, colore)

### Fase 4: Gameplay Mobile (2 settimane)
- [ ] Proposta tecnologie
- [ ] Sistema votazione
- [ ] Risoluzione dilemmi

### Fase 5: Polish & Testing (1 settimana)
- [ ] Gestione disconnessioni
- [ ] Error handling
- [ ] Testing con utenti reali

**Totale stimato: 6-8 settimane** (per sviluppatore esperto)

---

## 💡 Raccomandazioni

### Opzione 1: PWA (Consigliata per MVP)
- ✅ Più veloce da sviluppare
- ✅ Nessun app store necessario
- ✅ Funziona su tutti i dispositivi
- ✅ Condivide codice con web app

### Opzione 2: React Native
- ✅ Esperienza nativa migliore
- ✅ Possibilità di notifiche push
- ⚠️ Richiede più tempo
- ⚠️ Build separati per iOS/Android

### Opzione 3: Ibrido
- Inizia con PWA per MVP
- Migra a React Native se necessario

---

## 📊 Conclusione

**Fattibilità: ALTA** ✅

Il gioco è ben strutturato per diventare multiplayer. La separazione tra logica e UI facilita molto la transizione. Le principali sfide sono:

1. **Tecniche**: Gestione stato server-side e WebSocket (standard, ben documentato)
2. **UX**: Design interfaccia mobile semplice e intuitiva
3. **Testing**: Testare con utenti reali per affinare l'esperienza

**Raccomandazione**: Procedere con implementazione a fasi, iniziando con PWA per velocizzare lo sviluppo e validare il concetto.

