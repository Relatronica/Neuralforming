# 🔧 Fix per l'errore "Missing script: start" su Render

## Problema

Render sta cercando di eseguire `npm start` dalla root del progetto invece che dalla directory `server`, causando l'errore "Missing script: start".

## Soluzione

### Step 1: Verifica la Configurazione su Render

1. Vai su [Render Dashboard](https://dashboard.render.com/)
2. Apri il tuo servizio `neuralforming-server`
3. Vai su **Settings** (Impostazioni)
4. Scorri fino a **Build & Deploy**

### Step 2: Imposta la Root Directory

⚠️ **IMPORTANTE**: Nella sezione **Root Directory**, imposta:
```
server
```

Questo dice a Render di eseguire tutti i comandi dalla directory `server` invece che dalla root del progetto.

### Step 3: Verifica i Comandi

Assicurati che i comandi siano impostati come segue (senza `cd server &&` perché Render usa già la root directory):

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 4: Salva e Riavvia

1. Clicca su **Save Changes**
2. Render riavvierà automaticamente il servizio con la nuova configurazione
3. Il deploy dovrebbe completarsi con successo

## Verifica

Dopo aver salvato, dovresti vedere nei log di Render che i comandi vengono eseguiti dalla directory `server`:

```
==> Building in /opt/render/project/src/server
==> Running 'npm install'
==> Running 'npm run build'
==> Running 'npm start'
```

Se vedi ancora errori, verifica che:
- ✅ Root Directory sia impostato su `server` (non `/server` o `./server`)
- ✅ I comandi non includano `cd server &&`
- ✅ Il file `server/package.json` contenga lo script `start`

