# 🚀 Guida al Deploy - Neuralforming

Questa guida spiega come mettere online l'applicazione Neuralforming usando **Netlify** per il frontend (client React) e **Render** per il backend (server multiplayer Socket.io).

---

## 📋 Prerequisiti

1. Un account su [GitHub](https://github.com/) con il repository del progetto caricato.
2. Un account gratuito su [Netlify](https://www.netlify.com/).
3. Un account gratuito su [Render](https://render.com/).

---

## ⚡ Guida Rapida (Quick Start)

### 1. Backend su Render (5 minuti)
1. Vai su [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service** e connetti il tuo repository GitHub.
2. Configura le seguenti impostazioni:
   - **Name**: `neuralforming-server`
   - **Environment**: `Node`
   - **Root Directory**: `server` ⚠️ *FONDAMENTALE: altrimenti il deploy fallirà.*
   - **Build Command**: `npm install --include dev && npm run build` (l'opzione `--include dev` serve per scaricare i tipi TypeScript).
   - **Start Command**: `npm start`
   - **Plan**: `Free`
3. Clicca su **Create Web Service** e copia l'URL provvisorio del servizio una volta avviato (es: `https://neuralforming-server.onrender.com`).

### 2. Frontend su Netlify (3 minuti)
1. Vai su [Netlify Dashboard](https://app.netlify.com/) → **Add new site** → **Import an existing project** e connetti il repository GitHub.
2. Le impostazioni di build verranno rilevate automaticamente dal file `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Aggiungi le variabili d'ambiente in **Site settings** → **Environment variables**:
   - `VITE_SITE_URL`: L'URL pubblico del sito (es: `https://neuralforming.netlify.app`) ⚠️ *Senza barra finale `/`*.
   - `VITE_SERVER_URL`: L'URL del tuo server Render (es: `https://neuralforming-server.onrender.com`).
   - `RESEND_API_KEY`: chiave API Resend per il form Contatti.
   - (opzionali) `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.
4. Clicca su **Deploy site** e copia l'URL del sito generato da Netlify (es: `https://neuralforming.netlify.app`).

### 3. Sincronizzazione Finale (1 minuto)
1. Torna su Render, vai nelle impostazioni del tuo Web Service e aggiungi queste variabili d'ambiente:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CLIENT_URL`: L'URL del tuo sito Netlify (es: `https://neuralforming.netlify.app`) ⚠️ *Senza barra finale `/`*.
2. Salva le modifiche. Render riavvierà automaticamente il servizio. La tua PWA è ora completamente online e funzionante! 🎉

---

## 🔧 Dettagli di Configurazione e Variabili d'Ambiente

### Variabili per il Server (Render)
| Variabile | Valore | Descrizione |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Imposta l'ambiente in modalità produzione. |
| `PORT` | `10000` | Porta interna utilizzata da Render. |
| `CLIENT_URL` | `https://tuo-sito.netlify.app` | URL del frontend (essenziale per configurare correttamente il CORS). **Non inserire la barra finale `/`**. |

### Variabili per il Client (Netlify)
| Variabile | Valore | Descrizione |
| :--- | :--- | :--- |
| `VITE_SITE_URL` | `https://tuo-sito.netlify.app` | URL pubblico del frontend (canonical, Open Graph, sitemap). **Senza barra finale**. |
| `VITE_SERVER_URL` | `https://tuo-server.onrender.com` | URL del server WebSocket su Render a cui il client si connetterà. |
| `RESEND_API_KEY` | chiave Resend | API key per il form Contatti (`POST /api/contact`). Senza questa variabile l'invio non parte. |
| `CONTACT_TO_EMAIL` | `info@relatronica.com` | Destinatario dei messaggi (opzionale, ha un default). |
| `CONTACT_FROM_EMAIL` | `Neuralforming <onboarding@resend.dev>` | Mittente Resend (opzionale). Con il dominio di prova usa `onboarding@resend.dev`. |

---

## 🐛 Risoluzione dei Problemi (Troubleshooting)

### 🔴 Errore CORS in console o disconnessione immediata del socket
* **Causa**: La variabile `CLIENT_URL` su Render non corrisponde esattamente all'URL del frontend su Netlify.
* **Risoluzione**: Controlla che l'URL includa `https://`, non contenga una barra finale `/` e corrisponda all'indirizzo effettivo del frontend.

### 🔴 Il deploy su Render fallisce con "Missing script: start" o simili
* **Causa**: Non è stata impostata la **Root Directory** su `server` nella configurazione di Render, quindi il sistema sta cercando di eseguire i comandi nella root del progetto anziché nella sottocartella del server.
* **Risoluzione**: Vai in **Settings** su Render, trova la voce **Root Directory** e impostala su `server`.

### 🔴 La prima connessione al gioco è estremamente lenta (30+ secondi)
* **Causa**: Il piano gratuito di Render mette in modalità "sleep" (sospensione) il server dopo 15 minuti di inattività.
* **Risoluzione**: Questo è un comportamento standard del piano *Free* di Render. La prima richiesta "sveglierà" il server, e le successive connessioni saranno immediate. Per evitarlo, è necessario passare a un piano a pagamento (Starter).

---

## 🔐 Sicurezza e Best Practices
* **File `.env`**: Non caricare mai i file `.env` o `.env.production` su GitHub. Utilizza sempre i pannelli di controllo di Netlify e Render per gestire le variabili d'ambiente.
* **HTTPS**: Sia Netlify che Render gestiscono automaticamente i certificati SSL (HTTPS/WSS), garantendo la sicurezza delle connessioni e il corretto funzionamento delle funzionalità PWA su dispositivi mobili.
