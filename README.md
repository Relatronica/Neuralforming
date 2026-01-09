# 🧠 Neuralforming

Un gioco educativo **multiplayer** che simula lo sviluppo di un'intelligenza artificiale bilanciando tecnologia avanzata ed etica. Disponibile come **Progressive Web App (PWA)** per un'esperienza nativa su qualsiasi dispositivo.

## 🎯 Obiettivo del Gioco

Assumi il ruolo di un **Politico** che lavora con un team di sviluppatori per "formare" un'intelligenza artificiale. L'obiettivo è costruire la IA più avanzata ed eticamente equilibrata possibile, affrontando dilemmi morali complessi, votazioni parlamentari e conseguenze imprevedibili delle tue decisioni.

## 🎮 Come Giocare

### 🏛️ Modalità di Gioco

Il gioco supporta due modalità:

1. **🎯 Gioco Singolo**: Gioca da solo contro l'IA per imparare le meccaniche
2. **👥 Multiplayer**: Gioca con 3-6 giocatori umani in tempo reale via WebSocket

### Fasi del Turno

Ogni turno è diviso in **4 fasi principali**:

1. **🔬 Sviluppo Tecnologico**: Pesca una carta "Tecnologia" e aggiungila alla tua IA per migliorare le sue capacità avanzate (machine learning, coscienza artificiale, ecc.)

2. **⚖️ Dilemma Etico**: Affronta un dilemma morale complesso e scegli tra 2-3 opzioni eticamente differenti, ciascuna con conseguenze uniche

3. **🏛️ Votazione Parlamentare**: Le tue proposte tecnologiche vengono sottoposte al voto degli altri giocatori. Il sistema di punteggio premia strategie cooperative ma punisce comportamenti opportunistici

4. **🎭 Conseguenze**: Scopri gli effetti a lungo termine delle tue decisioni attraverso eventi narrativi dinamici

### 🎯 Meccaniche di Gioco

- **🧬 Punti Tecnologia**: Guadagnati dalle carte tecnologia implementate
- **⚖️ Punti Etica**: Guadagnati dalle scelte moralmente corrette nei dilemmi
- **🧠 Punti Neuralforming**: Punteggio complessivo che combina tecnologia ed etica
- **🏛️ Sistema di Voto**: Votazioni parlamentari con incentivi strategici
- **🎲 Eventi Dinamici**: Notizie, traguardi e conseguenze che influenzano il gameplay

### 🏆 Condizioni di Vittoria

Il gioco termina quando:
- ✅ **Vittoria**: Raggiungi almeno **50 punti Neuralforming** E almeno **25 punti Etica**
- ❌ **Sconfitta**: Raggiungi 50+ punti Neuralforming ma meno di 25 punti Etica (IA tecnicamente avanzata ma eticamente inaccettabile)

## 🚀 Installazione e Avvio

### Frontend (Client)
```bash
# Installa le dipendenze del frontend
npm install

# Avvia il client in modalità sviluppo
npm run dev

# Build del frontend per produzione
npm run build

# Preview della build
npm run preview
```

### Backend (Server Multiplayer)
```bash
# Vai nella cartella server
cd server

# Installa le dipendenze del server
npm install

# Avvia il server in modalità sviluppo (con TypeScript)
npm run dev

# Build del server per produzione
npm run build

# Avvia il server in produzione
npm start
```

### 🎮 Giocare

1. **Avvia il server**: `cd server && npm run dev`
2. **Avvia il client**: `npm run dev` (in un altro terminale)
3. **Apri il browser**: Vai su `http://localhost:5173`
4. **Installa come PWA**: Clicca "Installa App" nel browser per un'esperienza nativa

## 🛠️ Architettura e Tecnologie

### Frontend
- **⚛️ React 18** - Framework UI moderno con hooks
- **🔷 TypeScript** - Type safety completa
- **⚡ Vite** - Build tool ultra-veloce con HMR
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **📱 PWA** - Progressive Web App con service worker
- **📷 QR Code Scanner** - Scansione integrata per join rapido alle partite

### Backend
- **🟢 Node.js + Express** - Server HTTP/WebSocket
- **🔌 Socket.io** - Comunicazione real-time bidirezionale
- **🔷 TypeScript** - Type safety anche lato server
- **🎮 Game Server Engine** - Logica di gioco centralizzata
- **👥 Room Management** - Gestione partite multiplayer

### Caratteristiche Tecniche
- **🔄 Real-time Multiplayer** - Fino a 6 giocatori simultaneamente
- **💾 Session Persistence** - Riconnessione automatica dopo refresh
- **📱 Responsive Design** - Ottimizzato per desktop, tablet e mobile
- **🎯 Game State Sync** - Sincronizzazione perfetta tra tutti i client

## 📁 Architettura del Progetto

```
📦 Neuralforming/
├── 📁 docs/                          # 📚 Documentazione organizzata
│   ├── README.md                     # Indice della documentazione
│   ├── analysis/                     # Analisi tecniche e design
│   ├── deployment/                   # Guide di deploy
│   ├── multiplayer/                  # Documentazione multiplayer
│   └── archived/                     # Documenti implementati
├── 📁 server/                        # 🖥️ Backend Node.js
│   ├── src/
│   │   ├── GameServer.ts             # Server WebSocket principale
│   │   ├── server.ts                 # Server HTTP entry point
│   │   └── types.ts                  # Tipi TypeScript server
│   ├── dist/                         # Build del server
│   └── package.json
├── 📁 src/                           # ⚛️ Frontend React
│   ├── components/                   # Componenti React
│   │   ├── Board/                    # Tabellone di gioco
│   │   ├── Cards/                    # Carte (Tecnologie, Dilemmi, Conseguenze)
│   │   ├── Dashboard/                # Dashboard punteggi
│   │   ├── Game/                     # Componenti di gioco principali
│   │   └── PlayerApp/                # App mobile/PWA per giocatori
│   ├── contexts/                     # React Context (WebSocket, Game)
│   ├── data/                         # 📄 Dati JSON delle carte
│   ├── game/                         # 🎮 Logica di gioco
│   │   ├── GameEngine.ts             # Engine principale
│   │   ├── ParliamentVoting.ts       # Sistema di votazione
│   │   ├── Scoring.ts                # Sistema di punteggio
│   │   └── TurnManager.ts            # Gestione turni
│   ├── hooks/                        # Custom React hooks
│   ├── types/                        # Definizioni TypeScript
│   └── utils/                        # Utility functions
├── 📁 public/                        # 📱 Assets statici PWA
│   ├── icon-192.svg                  # Icone PWA
│   └── images/                       # Immagini statiche
└── 📄 Configurazione
    ├── package.json                  # Dipendenze frontend
    ├── vite.config.ts                # Config Vite
    ├── tailwind.config.js            # Config Tailwind
    ├── tsconfig.json                 # Config TypeScript
    └── manifest.webmanifest          # Config PWA
```

## 🎨 Caratteristiche Principali

### 🎮 Game Design
- ✅ **Multiplayer Real-time**: 3-6 giocatori simultaneamente
- ✅ **Sistema di Voto Parlamentare**: Strategie cooperative vs opportunistiche
- ✅ **8 Dilemmi Etici Complessi**: Scelte morali con conseguenze reali
- ✅ **15 Tecnologie Diverse**: Dallo machine learning alla coscienza artificiale
- ✅ **Sistema di Conseguenze Dinamiche**: Eventi narrativi che influenzano il gameplay
- ✅ **Bilanciamento Punteggio**: Tecnologia + Etica = Neuralforming score

### 💻 Tecnologie e UX
- ✅ **Progressive Web App**: Installabile come app nativa
- ✅ **QR Code Scanner Integrato**: Join rapido alle partite
- ✅ **Tour Guidato Interattivo**: Onboarding per nuovi giocatori
- ✅ **Responsive Design**: Ottimizzato per tutti i dispositivi
- ✅ **Session Persistence**: Riconnessione automatica dopo refresh
- ✅ **Real-time Notifications**: Aggiornamenti live durante il gioco

### 🎯 Caratteristiche Educative
- ✅ **Dilemmi Etici Realistici**: Basati su problemi IA attuali
- ✅ **Sistema di Traguardi**: Obiettivi di progresso sbloccabili
- ✅ **Notizie Dinamiche**: Eventi che riflettono scelte di gioco
- ✅ **Conseguenze a Lungo Termine**: Impara dall'impatto delle decisioni
- ✅ **Design Inclusivo**: Accessibile a giocatori di tutti i livelli

## 🚀 Deployment

Il progetto supporta deployment semplice su:
- **Netlify** (Frontend) + **Render** (Backend) - Vedi [docs/deployment/DEPLOY.md](docs/deployment/DEPLOY.md)
- **Vercel** (Frontend + Backend)
- **Docker** (Full-stack containerizzato)

## 📚 Documentazione

- **[📖 Documentazione Completa](docs/README.md)** - Guida alla documentazione organizzata
- **[🎮 Analisi Game Design](docs/analysis/)** - Documenti tecnici e analisi
- **[🚀 Guide Deployment](docs/deployment/)** - Come mettere online il gioco
- **[👥 Multiplayer](docs/multiplayer/)** - Documentazione sistema multiplayer

## 🤝 Contribuire

Il progetto è **open source** e accetta contributi! Vedi la [documentazione](docs/) per linee guida su:
- Aggiungere nuovi dilemmi etici
- Implementare nuove tecnologie
- Migliorare il bilanciamento di gioco
- Estendere le funzionalità multiplayer

## 📝 Licenza

Questo progetto è un **gioco educativo open source** distribuito sotto licenza MIT.

---

*Creato con ❤️ per esplorare i dilemmi etici dell'Intelligenza Artificiale*

