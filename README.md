# Neuralforming

Un gioco educativo **multiplayer** che simula lo sviluppo di un'intelligenza artificiale bilanciando tecnologia avanzata ed etica. Disponibile come **Progressive Web App (PWA)** per un'esperienza nativa su qualsiasi dispositivo.

## Obiettivo del Gioco

Assumi il ruolo di un **Politico** che lavora con un team di sviluppatori per "formare" un'intelligenza artificiale. L'obiettivo e costruire la IA piu avanzata ed eticamente equilibrata possibile, affrontando dilemmi morali complessi, votazioni parlamentari e conseguenze imprevedibili delle tue decisioni. A ciascun giocatore viene assegnato un **obiettivo segreto** da completare per primo per vincere la partita.

## Come Giocare

### Modalita di Gioco

Il gioco supporta due modalita:

1. **Gioco Singolo**: Gioca da solo contro 4 avversari IA con difficolta adattiva e un sistema di opinione pubblica
2. **Multiplayer**: Gioca con 2-8 giocatori in tempo reale via WebSocket, con un dispositivo "master" (tabellone) e i giocatori collegati da smartphone

### Architettura Master/Player

In modalita multiplayer, il gioco funziona con una separazione tra:
- **Master**: Un dispositivo (desktop o tablet) che mostra il tabellone, il parlamento e lo stato di gioco
- **Player**: Ogni giocatore si collega dal proprio smartphone tramite QR code o link diretto

### Fasi del Turno

Ogni turno e diviso in **4 fasi principali**:

1. **Sviluppo Tecnologico**: Pesca una carta "Tecnologia" dalla tua mano e proponila al parlamento. Le carte includono anche Jolly speciali che modificano gli effetti dei dilemmi
2. **Dilemma Etico**: Affronta un dilemma morale complesso e vota tra le opzioni disponibili. In multiplayer tutti i giocatori votano e vince l'opzione con piu voti
3. **Votazione Parlamentare**: Le proposte tecnologiche vengono sottoposte al voto degli altri giocatori con un sistema di incentivi che premia il voto strategico
4. **Conseguenze**: Scopri gli effetti a lungo termine delle tue decisioni attraverso eventi narrativi dinamici

### Meccaniche di Gioco

- **Punti Tecnologia**: Guadagnati dalle carte tecnologia approvate in parlamento
- **Punti Etica**: Guadagnati dalle scelte moralmente corrette nei dilemmi
- **Punti Neuralforming**: Punteggio complessivo che combina tecnologia ed etica
- **Bilanciamento**: Rapporto tra tecnologia ed etica (0-1), fondamentale per la vittoria
- **Sistema di Voto Parlamentare**: Con soglie di approvazione (50%, 70%) e bonus/penalita per i votanti
- **Obiettivi Segreti**: Assegnati a inizio partita, ciascuno con condizioni di vittoria uniche
- **Traguardi (Milestones)**: Sbloccabili durante il gioco con bonus permanenti
- **Jolly**: Carte speciali che modificano gli effetti dei dilemmi etici
- **Eventi Globali**: Attivati da condizioni specifiche, influenzano tutti i giocatori
- **Notizie Dinamiche**: Ticker di notizie che riflettono le scelte di gioco

### Traguardi Sbloccabili

- **Pioniere Tecnologico** (30 punti tech): +15% bonus nelle votazioni
- **Guardiano Etico** (25 punti etica): Protezione dagli eventi negativi
- **Leader Bilanciato** (bilanciamento > 0.6): +50% punti su tecnologie bilanciate
- **Innovatore Neuralforming** (25 punti NF): Carta extra ogni turno

### Condizioni di Vittoria

Il gioco termina quando:
- **Vittoria per obiettivo**: Un giocatore completa il proprio obiettivo segreto
- **Vittoria standard**: Raggiungi almeno 65 punti Neuralforming, 45 punti Etica, 5 tecnologie e bilanciamento >= 0.5
- **Sconfitta**: Raggiungi punteggi alti in tecnologia ma insufficienti in etica (IA tecnicamente avanzata ma eticamente inaccettabile)

## Installazione e Avvio

### Requisiti

- Node.js 18+
- npm

### Frontend (Client)

```bash
# Installa le dipendenze del frontend
npm install

# Avvia il client in modalita sviluppo
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

# Avvia il server in modalita sviluppo (con TypeScript)
npm run dev

# Build del server per produzione
npm run build

# Avvia il server in produzione
npm start
```

### Giocare

1. **Avvia il server**: `cd server && npm run dev`
2. **Avvia il client**: `npm run dev` (in un altro terminale)
3. **Apri il browser**: Vai su `http://localhost:5173`
4. **Installa come PWA**: Clicca "Installa App" nel browser per un'esperienza nativa

## Architettura e Tecnologie

### Frontend

- **React 18** - Framework UI con hooks
- **TypeScript** - Type safety completa
- **Vite 5** - Build tool con HMR
- **Tailwind CSS** - Utility-first CSS framework
- **D3.js** - Visualizzazione del parlamento a emiciclo
- **PWA** - Progressive Web App con service worker e auto-update
- **QR Code** - Generazione e scansione per join rapido alle partite
- **React Joyride** - Tour guidato interattivo per nuovi giocatori
- **React Router** - Routing client-side

### Backend

- **Node.js + Express** - Server HTTP/WebSocket
- **Socket.io** - Comunicazione real-time bidirezionale
- **TypeScript** - Type safety anche lato server
- **Game Server Engine** - Logica di gioco centralizzata con gestione stanze
- **Room Management** - Creazione stanze, cleanup automatico, grace period per riconnessione
- **Rate Limiting** - Protezione da spam (5 azioni/secondo per socket)

### Caratteristiche Tecniche

- **Real-time Multiplayer** - 2-8 giocatori simultaneamente
- **Master Heartbeat** - Monitoraggio connessione master con timeout e riconnessione
- **Session Persistence** - Riconnessione automatica con grace period di 60 secondi
- **Responsive Design** - Ottimizzato per desktop, tablet e mobile
- **Game State Sync** - Sincronizzazione stato tra master e player con filtraggio dati
- **Room Cleanup** - Pulizia automatica stanze inattive (30 min) e partite finite (5 min)
- **Mid-game Join** - Possibilita di unirsi a partite in corso

## Architettura del Progetto

```
Neuralforming/
├── docs/                              # Documentazione organizzata
│   ├── README.md                      # Indice della documentazione
│   ├── analysis/                      # Analisi tecniche e design
│   ├── deployment/                    # Guide di deploy
│   ├── multiplayer/                   # Documentazione multiplayer
│   └── archived/                      # Documenti implementati
├── server/                            # Backend Node.js
│   ├── src/
│   │   ├── GameServer.ts              # Server WebSocket principale
│   │   ├── server.ts                  # Server HTTP entry point
│   │   └── types.ts                   # Tipi TypeScript server
│   ├── dist/                          # Build del server
│   └── package.json
├── src/                               # Frontend React
│   ├── components/
│   │   ├── Board/                     # Tabellone, emiciclo parlamentare (D3)
│   │   ├── Cards/                     # Carte (Tecnologie, Dilemmi, Conseguenze)
│   │   ├── Dashboard/                 # Dashboard punteggi
│   │   ├── Game/                      # Componenti di gioco principali
│   │   ├── Players/                   # Lista giocatori e card
│   │   ├── PlayerApp/                 # App PWA per giocatori (mobile)
│   │   └── SinglePlayer/             # Modalita giocatore singolo
│   ├── contexts/                      # React Context (WebSocket, Game)
│   ├── data/                          # Dati JSON delle carte e obiettivi
│   │   ├── technologies.json          # Carte tecnologia (inclusi jolly)
│   │   ├── dilemmas.json              # Dilemmi etici
│   │   ├── consequences.json          # Conseguenze
│   │   ├── objectives.json            # Obiettivi segreti
│   │   ├── news.json                  # Notizie di gioco
│   │   ├── headerNews.json            # Ticker notizie
│   │   └── openingStories.json        # Storie introduttive
│   ├── game/                          # Logica di gioco
│   │   ├── GameEngine.ts              # Engine principale
│   │   ├── ParliamentVoting.ts        # Sistema di votazione parlamentare
│   │   ├── Scoring.ts                 # Sistema di punteggio
│   │   └── TurnManager.ts            # Gestione turni
│   ├── hooks/                         # Custom React hooks
│   ├── types/                         # Definizioni TypeScript
│   └── utils/                         # Utility functions
├── public/                            # Assets statici PWA
│   ├── icon-192.svg                   # Icone PWA
│   └── images/                        # Immagini statiche
├── package.json                       # Dipendenze frontend
├── vite.config.ts                     # Config Vite + PWA
├── tailwind.config.js                 # Config Tailwind
├── tsconfig.json                      # Config TypeScript
├── render.yaml                        # Config deploy Render
└── manifest.webmanifest               # Config PWA
```

## Caratteristiche Principali

### Game Design

- Multiplayer real-time con architettura master/player
- Modalita giocatore singolo con 4 avversari IA
- Sistema di voto parlamentare con visualizzazione a emiciclo (D3)
- Sistema di obiettivi segreti con condizioni di vittoria personalizzate
- 8+ dilemmi etici complessi con scelte a conseguenze multiple
- 15+ tecnologie diverse dallo machine learning alla coscienza artificiale
- Jolly speciali che modificano gli effetti dei dilemmi
- Traguardi sbloccabili con bonus permanenti
- Eventi globali e conseguenze narrative dinamiche
- Bilanciamento punteggio: Tecnologia + Etica = Neuralforming score

### Tecnologie e UX

- Progressive Web App installabile come app nativa
- QR Code integrato per join rapido alle partite
- Tour guidato interattivo (React Joyride) per onboarding
- Responsive design ottimizzato per tutti i dispositivi
- Animazioni di transizione turno, dilemma e sblocco traguardi
- Storia introduttiva con modale narrativa
- Ticker notizie in header con rotazione automatica
- Session persistence con riconnessione automatica
- Real-time notifications durante il gioco

### Caratteristiche Educative

- Dilemmi etici realistici basati su problemi IA attuali
- Sistema di traguardi con obiettivi di progresso sbloccabili
- Notizie dinamiche che riflettono le scelte di gioco
- Conseguenze a lungo termine per imparare dall'impatto delle decisioni
- Design inclusivo accessibile a giocatori di tutti i livelli

## Deployment

Il progetto supporta deployment su:
- **Netlify** (Frontend) + **Render** (Backend) - Vedi [docs/deployment/DEPLOY.md](docs/deployment/DEPLOY.md)
- **Vercel** (Frontend + Backend)
- **Docker** (Full-stack containerizzato)

La configurazione per Render e inclusa nel file `render.yaml`.

## Documentazione

- [Documentazione Completa](docs/README.md) - Guida alla documentazione organizzata
- [Analisi Game Design](docs/analysis/) - Documenti tecnici e analisi
- [Guide Deployment](docs/deployment/) - Come mettere online il gioco
- [Multiplayer](docs/multiplayer/) - Documentazione sistema multiplayer

## Contribuire

Il progetto e **open source** e accetta contributi! Vedi la [documentazione](docs/) per linee guida su:
- Aggiungere nuovi dilemmi etici
- Implementare nuove tecnologie
- Migliorare il bilanciamento di gioco
- Estendere le funzionalita multiplayer

## Licenza

Questo progetto e distribuito sotto licenza **GNU General Public License v3.0 (GPL-3.0)**.
Vedi il file [LICENSE](LICENSE) per i dettagli completi.

---

*Creato per esplorare i dilemmi etici dell'Intelligenza Artificiale*
