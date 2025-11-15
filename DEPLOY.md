# Guida al Deploy - Neuralforming

Questa guida spiega come mettere online l'app Neuralforming usando **Netlify** per il frontend e **Render** per il backend.

## 📋 Prerequisiti

1. Account su [Netlify](https://www.netlify.com/)
2. Account su [Render](https://render.com/)
3. Repository GitHub del progetto

## 🚀 Deploy del Backend su Render

### 1. Connetti il Repository
1. Vai su [Render Dashboard](https://dashboard.render.com/)
2. Clicca su **"New +"** → **"Web Service"**
3. Connetti il tuo repository GitHub
4. Seleziona il repository `Neuralforming`

### 2. Configurazione del Servizio

**Opzione A: Usa il file `render.yaml` (Consigliato)**
1. Durante la creazione del servizio, Render dovrebbe rilevare automaticamente il file `render.yaml`
2. Se non lo rileva, puoi specificarlo manualmente nella configurazione

**Opzione B: Configurazione Manuale**
- **Name**: `neuralforming-server` (o un nome a tua scelta)
- **Environment**: `Node`
- **Root Directory**: `server` ⚠️ IMPORTANTE: imposta questa opzione
- **Build Command**: `npm install --include dev && npm run build`
  - ⚠️ `--include dev` è necessario perché Render imposta `NODE_ENV=production`, quindi npm non installa le devDependencies di default (necessarie per TypeScript)
- **Start Command**: `npm start`
- **Plan**: Scegli il piano gratuito (Free) o a pagamento

⚠️ **ATTENZIONE**: Se non imposti correttamente la **Root Directory** su `server`, Render eseguirà i comandi dalla root del progetto e il deploy fallirà!

### 3. Variabili d'Ambiente
Aggiungi queste variabili d'ambiente nella sezione **Environment**:

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-netlify-app.netlify.app
```

⚠️ **IMPORTANTE**: Non impostare `CLIENT_URL` subito, lo farai dopo aver deployato il frontend su Netlify.

### 4. Deploy
1. Clicca su **"Create Web Service"**
2. Render inizierà il build e il deploy
3. Una volta completato, copia l'URL del servizio (es: `https://neuralforming-server.onrender.com`)

## 🎨 Deploy del Frontend su Netlify

### 1. Connetti il Repository
1. Vai su [Netlify Dashboard](https://app.netlify.com/)
2. Clicca su **"Add new site"** → **"Import an existing project"**
3. Connetti il tuo repository GitHub
4. Seleziona il repository `Neuralforming`

### 2. Configurazione del Build
Netlify dovrebbe rilevare automaticamente le impostazioni dal file `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 3. Variabili d'Ambiente
Aggiungi questa variabile d'ambiente nella sezione **Site settings** → **Environment variables**:

```
VITE_SERVER_URL=https://your-render-app.onrender.com
```

⚠️ **IMPORTANTE**: Sostituisci `your-render-app.onrender.com` con l'URL effettivo del tuo servizio Render.

### 4. Deploy
1. Clicca su **"Deploy site"**
2. Netlify inizierà il build e il deploy
3. Una volta completato, copia l'URL del sito (es: `https://neuralforming.netlify.app`)

## 🔄 Configurazione Finale

### Aggiorna CLIENT_URL su Render
1. Torna su Render Dashboard
2. Vai alle impostazioni del tuo servizio
3. Aggiorna la variabile `CLIENT_URL` con l'URL di Netlify:
   ```
   CLIENT_URL=https://your-netlify-app.netlify.app
   ```
4. Render riavvierà automaticamente il servizio

### Verifica la Connessione
1. Apri il sito su Netlify
2. Prova a creare una room e giocare
3. Controlla la console del browser per eventuali errori di connessione

## 🐛 Troubleshooting

### Problema: CORS Error
**Soluzione**: Verifica che `CLIENT_URL` su Render corrisponda esattamente all'URL di Netlify (incluso `https://`)

### Problema: Socket.io non si connette
**Soluzione**: 
- Verifica che `VITE_SERVER_URL` su Netlify corrisponda all'URL di Render
- Assicurati che il backend sia in esecuzione su Render
- Controlla i log su Render per eventuali errori

### Problema: Build fallisce su Netlify
**Soluzione**:
- Verifica che tutte le dipendenze siano in `package.json`
- Controlla i log di build su Netlify per errori specifici
- Assicurati che Node.js versione 18 sia disponibile

### Problema: Build fallisce su Render
**Soluzione**:
- Verifica che il percorso `server/` sia corretto
- Controlla che `tsconfig.json` nel server sia configurato correttamente
- Verifica i log di build su Render

## 📝 Note Importanti

1. **Render Free Tier**: Il servizio gratuito di Render va in "sleep" dopo 15 minuti di inattività. La prima richiesta dopo il sleep può richiedere fino a 30 secondi.

2. **Netlify Free Tier**: Include 100GB di bandwidth al mese, sufficiente per la maggior parte dei casi d'uso.

3. **WebSocket**: Render supporta WebSocket, quindi Socket.io funzionerà correttamente.

4. **HTTPS**: Sia Netlify che Render forniscono HTTPS automaticamente.

## 🔐 Sicurezza

- Non committare file `.env` nel repository
- Usa sempre variabili d'ambiente per configurazioni sensibili
- Verifica che CORS sia configurato correttamente per evitare attacchi

## 📚 Risorse

- [Documentazione Netlify](https://docs.netlify.com/)
- [Documentazione Render](https://render.com/docs)
- [Socket.io Deployment Guide](https://socket.io/docs/v4/deployment/)

