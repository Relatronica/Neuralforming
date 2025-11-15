# 🚀 Quick Start - Deploy Neuralforming

## Backend su Render (5 minuti)

1. Vai su [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**
2. Connetti il repository GitHub
3. Configurazione:
   - **Name**: `neuralforming-server`
   - **Root Directory**: `server` ⚠️ IMPORTANTE: imposta questa opzione!
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

⚠️ **Se il deploy fallisce con "Missing script: start"**, verifica che **Root Directory** sia impostato su `server` nelle impostazioni del servizio Render!
4. Variabili d'ambiente (da aggiungere dopo il deploy del frontend):
   - `NODE_ENV=production`
   - `PORT=10000`
   - `CLIENT_URL=https://your-netlify-app.netlify.app` ⚠️ Da impostare dopo
5. Clicca **Create Web Service** e copia l'URL (es: `https://neuralforming-server.onrender.com`)

## Frontend su Netlify (3 minuti)

1. Vai su [Netlify Dashboard](https://app.netlify.com/) → **Add new site** → **Import an existing project**
2. Connetti il repository GitHub
3. Configurazione (automatica da `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Variabile d'ambiente:
   - `VITE_SERVER_URL=https://your-render-app.onrender.com` (usa l'URL di Render)
5. Clicca **Deploy site** e copia l'URL (es: `https://neuralforming.netlify.app`)

## ⚙️ Configurazione Finale

Torna su Render e aggiorna `CLIENT_URL` con l'URL di Netlify. Render si riavvierà automaticamente.

## ✅ Verifica

Apri il sito su Netlify e prova a creare una room. Se funziona, sei online! 🎉

---

Per dettagli completi, vedi [DEPLOY.md](./DEPLOY.md)

