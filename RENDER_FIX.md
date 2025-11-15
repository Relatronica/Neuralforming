# 🔧 Fix per errori comuni su Render

## Problema 1: "Missing script: start"

Render sta cercando di eseguire `npm start` dalla root del progetto invece che dalla directory `server`, causando l'errore "Missing script: start".

## Problema 2: "Cannot find module './GameServer'"

Con ES modules, Node.js richiede che gli import relativi includano l'estensione `.js` anche se i file sorgente sono `.ts`. Questo è stato già corretto nel codice.

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

- **Build Command**: `npm install --include dev && npm run build`
  - `--include dev` assicura che le devDependencies (inclusi `@types/*`) vengano installate durante il build (necessario perché Render imposta NODE_ENV=production)
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

## Problema 3: "Could not find a declaration file for module 'express'"

Se vedi errori TypeScript che dicono che non trova i file di dichiarazione per i moduli (come `express`, `socket.io`, etc.), il problema è che le `devDependencies` (che contengono i tipi `@types/*`) non vengono installate durante il build.

**Soluzione**: Assicurati che il Build Command includa `--include dev`:
```
npm install --include dev && npm run build
```

⚠️ **IMPORTANTE**: Render imposta `NODE_ENV=production` durante il build, quindi npm di default non installa le `devDependencies`. Devi esplicitamente includerle con `--include dev`.

In alternativa, se Render continua a non installare le devDependencies, puoi spostare `@types/*` nelle `dependencies` invece che in `devDependencies` (anche se non è ideale per produzione).

## Note Importanti

### Import ES Modules

Con TypeScript e ES modules (`"type": "module"`), gli import relativi devono includere l'estensione `.js` nel codice sorgente TypeScript, anche se i file sono `.ts`. Questo è necessario perché Node.js richiede l'estensione nel codice compilato JavaScript.

**Esempio corretto:**
```typescript
import { GameServer } from './GameServer.js';  // ✅ Corretto
```

**Esempio errato:**
```typescript
import { GameServer } from './GameServer';  // ❌ Errato per ES modules
```

Questo problema è già stato corretto nei file:
- ✅ `server/src/server.ts`
- ✅ `server/src/GameServer.ts`

