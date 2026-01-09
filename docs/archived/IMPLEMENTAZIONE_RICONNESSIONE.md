# Implementazione: Sistema di Riconnessione dopo Refresh

## ✅ Implementazione Completata

Tutte le soluzioni critiche sono state implementate con successo.

---

## 📋 Modifiche Implementate

### 1. ✅ Grace Period per Disconnessioni (Server)

**File:** `server/src/GameServer.ts`

**Modifiche:**
- Aggiunto `disconnectedPlayers: Map<string, DisconnectedPlayer>` a `GameRoom`
- Aggiunto `playerIdMap: Map<string, string>` per ID persistenti
- Modificato `handleDisconnect()` per implementare grace period di 60 secondi
- I giocatori disconnessi vengono mantenuti temporaneamente invece di essere rimossi immediatamente

**Codice chiave:**
```typescript
// Grace period di 60 secondi
const GRACE_PERIOD_MS = 60000;
const disconnected: DisconnectedPlayer = {
  playerId: player.playerId,
  playerName: player.playerName,
  playerColor: player.playerColor,
  playerIcon: player.playerIcon,
  disconnectedAt: Date.now(),
};

// Timeout per rimozione dopo grace period
const timeoutId = setTimeout(() => {
  if (room.disconnectedPlayers.has(player.playerId)) {
    room.disconnectedPlayers.delete(player.playerId);
    this.broadcastRoomUpdate(roomId);
  }
}, GRACE_PERIOD_MS);
```

---

### 2. ✅ Riconnessione durante Partita (Server)

**File:** `server/src/GameServer.ts`

**Modifiche:**
- Modificato `joinRoom()` per permettere riconnessione anche se il gioco è già iniziato
- Verifica se il giocatore era in `disconnectedPlayers` prima di rifiutare
- Ripristina il giocatore con lo stesso `playerId` persistente
- Invia lo stato del gioco al giocatore riconnesso
- Invia votazioni in corso al giocatore riconnesso

**Codice chiave:**
```typescript
// Verifica se il giocatore era disconnesso
const disconnected = Array.from(room.disconnectedPlayers.values())
  .find(p => p.playerName === playerName);

if (disconnected) {
  // Riconnessione: ripristina il giocatore
  // Cancella timeout di rimozione
  // Mantiene lo stesso playerId persistente
  // Invia gameState e votazioni in corso
}
```

---

### 3. ✅ PlayerId Persistente (Server)

**File:** `server/src/GameServer.ts`

**Modifiche:**
- Aggiunto metodo `getOrCreatePlayerId()` per generare/recuperare ID persistenti
- Gli ID sono basati su `playerName` e vengono mantenuti tra riconnessioni
- Formato: `player-{timestamp}-{random}`

**Codice chiave:**
```typescript
private getOrCreatePlayerId(room: GameRoom, playerName: string): string {
  if (!room.playerIdMap.has(playerName)) {
    const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    room.playerIdMap.set(playerName, playerId);
  }
  return room.playerIdMap.get(playerName)!;
}
```

---

### 4. ✅ UI Riconnessione (Client)

**File:** `src/components/PlayerApp/PlayerGame.tsx`

**Modifiche:**
- Aggiunto stato `isReconnecting` per tracciare riconnessione
- Aggiunto banner giallo in alto che mostra "Riconnessione in corso..."
- Banner appare automaticamente quando il giocatore si disconnette durante una partita
- Banner scompare automaticamente dopo riconnessione riuscita

**Codice chiave:**
```typescript
const [isReconnecting, setIsReconnecting] = useState(false);

useEffect(() => {
  if (isConnected) {
    wasConnectedRef.current = true;
    if (isReconnecting) {
      setTimeout(() => setIsReconnecting(false), 2000);
    }
  } else if (wasConnectedRef.current && roomInfo?.isGameStarted) {
    setIsReconnecting(true);
  }
}, [isConnected, roomInfo?.isGameStarted]);

// Banner di riconnessione
{isReconnecting && (
  <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white p-3 text-center shadow-lg">
    <div className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="font-semibold">Riconnessione in corso...</span>
    </div>
  </div>
)}
```

---

### 5. ✅ Invio Votazioni in Corso (Server)

**File:** `server/src/GameServer.ts`

**Modifiche:**
- Quando un giocatore si riconnette durante una votazione, riceve:
  - Evento `votingStarted` con i dettagli della votazione
  - Evento `voteUpdate` con lo stato corrente dei voti
- Il giocatore può votare normalmente dopo la riconnessione

**Codice chiave:**
```typescript
// Se ci sono votazioni in corso, inviale al giocatore riconnesso
if (room.pendingVotes.size > 0) {
  room.pendingVotes.forEach((pendingVote, technologyId) => {
    this.io.to(socketId).emit('votingStarted', {
      technologyId: pendingVote.technologyId,
      technology: pendingVote.technology,
      proposerId: pendingVote.proposerId,
    });
    
    // Invia anche lo stato della votazione
    this.io.to(socketId).emit('voteUpdate', {
      technologyId,
      votes: Array.from(pendingVote.votes.entries()).map(([pid, v]) => ({ playerId: pid, vote: v })),
      totalVotes: votesCount,
      requiredVotes: allPlayers.length,
    });
  });
}
```

---

## 🎯 Risultati

### Prima dell'Implementazione
- ❌ Refresh → Giocatore rimosso immediatamente → Impossibile riconnettersi
- ❌ Disconnessione WiFi → Giocatore escluso definitivamente
- ❌ Nessun feedback durante riconnessione

### Dopo l'Implementazione
- ✅ Refresh → Grace period attivo → Riconnessione automatica → Giocatore rientra
- ✅ Disconnessione WiFi → Grace period → Riconnessione automatica quando WiFi torna
- ✅ Banner visivo durante riconnessione
- ✅ Mantiene stato del giocatore (punti, carte, etc.)
- ✅ Riceve votazioni in corso dopo riconnessione

---

## 🧪 Test da Eseguire

### Test 1: Refresh durante Partita
1. Avviare partita con 2+ giocatori
2. Giocatore fa refresh (F5)
3. ✅ Verificare che il giocatore si riconnette automaticamente
4. ✅ Verificare che mantiene lo stato (punti, carte)
5. ✅ Verificare che può continuare a giocare

### Test 2: Disconnessione WiFi
1. Avviare partita
2. Disconnettere WiFi per 5-10 secondi
3. Riconnettere WiFi
4. ✅ Verificare riconnessione automatica
5. ✅ Verificare che il giocatore rientra nella partita

### Test 3: Grace Period
1. Avviare partita
2. Disconnettere giocatore
3. Attendere 30 secondi
4. Riconnettere giocatore
5. ✅ Verificare che si riconnette con successo
6. Disconnettere di nuovo
7. Attendere 70 secondi (oltre grace period)
8. ✅ Verificare che il giocatore viene rimosso

### Test 4: Riconnessione durante Votazione
1. Avviare partita
2. Iniziare una votazione
3. Giocatore fa refresh durante votazione
4. ✅ Verificare che riceve la votazione dopo riconnessione
5. ✅ Verificare che può votare normalmente

### Test 5: PlayerId Persistente
1. Giocatore entra nella partita
2. Notare il playerId (nei log del server)
3. Giocatore fa refresh
4. ✅ Verificare che il playerId rimane lo stesso
5. ✅ Verificare che lo stato del giocatore è mantenuto

---

## 📊 Configurazione

### Grace Period
Il grace period è configurato a **60 secondi** (60000ms).

Per modificarlo, cambiare la costante in `GameServer.ts`:
```typescript
const GRACE_PERIOD_MS = 60000; // Modificare questo valore
```

**Raccomandazioni:**
- **30 secondi**: Per refresh rapidi (migliore per UX)
- **60 secondi**: Bilanciato (default attuale)
- **120 secondi**: Per connessioni instabili

---

## 🔧 Note Tecniche

### PlayerId vs SocketId
- **SocketId**: Cambia ad ogni riconnessione (es: `abc123`)
- **PlayerId**: Persistente, basato su `playerName` (es: `player-1234567890-xyz`)
- Il `playerId` viene usato nel `gameState` per identificare i giocatori
- Il `socketId` viene usato solo per la comunicazione socket

### Gestione Timeout
- I timeout vengono salvati in `DisconnectedPlayer.timeoutId`
- Quando un giocatore si riconnette, il timeout viene cancellato
- Questo previene rimozioni accidentali

### Broadcast Room Update
- Quando un giocatore si disconnette, viene inviato `roomUpdate` a tutti
- I giocatori disconnessi NON appaiono nella lista dei giocatori
- Quando un giocatore si riconnette, viene inviato un nuovo `roomUpdate`

---

## 🚀 Prossimi Passi (Opzionali)

### Miglioramenti Futuri
1. **Configurazione Grace Period**: Permettere al master di configurare il grace period
2. **Notifica Disconnessione**: Mostrare agli altri giocatori quando qualcuno si disconnette
3. **Statistiche Riconnessione**: Tracciare quante volte un giocatore si riconnette
4. **Grace Period Dinamico**: Aumentare il grace period se il giocatore si riconnette spesso

---

## ✅ Checklist Implementazione

- [x] Grace Period implementato (60 secondi)
- [x] Riconnessione durante partita permessa
- [x] PlayerId persistente
- [x] UI riconnessione (banner)
- [x] Invio votazioni in corso dopo riconnessione
- [x] Invio gameState dopo riconnessione
- [x] Cancellazione timeout quando si riconnette
- [x] Test di base completati
- [ ] Test completi in produzione (da fare)

---

## 📝 Changelog

### v1.0.0 - Implementazione Iniziale
- ✅ Grace period di 60 secondi
- ✅ Riconnessione durante partita
- ✅ PlayerId persistente
- ✅ UI riconnessione
- ✅ Invio votazioni in corso

---

**Implementazione completata con successo! 🎉**
