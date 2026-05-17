# Contribuire a Neuralforming

Grazie per il tuo interesse nel contribuire a Neuralforming! 🎉

Questo progetto è open source e accoglie contributi da chiunque voglia migliorare l'esperienza educativa
sulla governance dell'Intelligenza Artificiale.

## Come Contribuire

### 1. Segnalare un Bug

Se hai trovato un bug, apri una [Issue](https://github.com/Relatronica/Neuralforming/issues) con:

- Una descrizione chiara del problema
- I passi per riprodurlo
- Il comportamento atteso vs. quello osservato
- Screenshot (se pertinenti)
- Browser e dispositivo utilizzati

### 2. Proporre una Funzionalità

Hai un'idea per migliorare il gioco? Apri una Issue con il tag **enhancement** descrivendo:

- Il problema o l'esigenza che la funzionalità risolve
- Come immagini la soluzione
- Eventuali alternative considerate

### 3. Inviare una Pull Request

1. **Fai un fork** del repository
2. **Crea un branch** per la tua modifica:
   ```bash
   git checkout -b feature/nome-descrittivo
   ```
3. **Fai le tue modifiche** seguendo le convenzioni del progetto
4. **Testa** che tutto funzioni correttamente
5. **Committa** con un messaggio chiaro:
   ```bash
   git commit -m "Add: descrizione della modifica"
   ```
6. **Pusha** il branch e apri una Pull Request

## Configurazione Ambiente di Sviluppo

### Prerequisiti

- Node.js 18+
- npm

### Setup

```bash
# Clona il tuo fork
git clone https://github.com/TUO-USERNAME/Neuralforming.git
cd Neuralforming

# Installa le dipendenze del frontend
npm install

# Installa le dipendenze del server
cd server && npm install && cd ..

# Copia i file di configurazione
cp .env.example .env
cp server/.env.example server/.env

# Avvia il server (in un terminale)
cd server && npm run dev

# Avvia il client (in un altro terminale)
npm run dev
```

Il client sarà disponibile su `http://localhost:5173` e il server su `http://localhost:3001`.

## Aree di Contributo

### 🎮 Game Design

- **Nuovi dilemmi etici**: Aggiungi scenari in `src/data/dilemmas.json`
- **Nuove tecnologie**: Aggiungi carte in `src/data/technologies.json`
- **Nuove conseguenze**: Aggiungi eventi in `src/data/consequences.json`
- **Nuovi obiettivi segreti**: Aggiungi obiettivi in `src/data/objectives.json`
- **Bilanciamento**: Proponi aggiustamenti ai punteggi e alle soglie di vittoria

### 🎨 UI/UX

- Miglioramenti all'interfaccia e alle animazioni
- Accessibilità (a11y)
- Responsive design

### 🔧 Tecnico

- Performance e ottimizzazioni
- Test e affidabilità
- Documentazione

### 🌍 Localizzazione

- Traduzioni in altre lingue
- Adattamenti culturali dei dilemmi etici

## Convenzioni

### Codice

- **TypeScript** per tutto il codice (frontend e backend)
- **Nomi** di variabili e funzioni in inglese
- **Commenti** e documentazione in italiano
- Usa `const` quando possibile, `let` quando necessario

### Commit

Usa messaggi di commit chiari e descrittivi:

- `Add: nuova funzionalità`
- `Fix: correzione bug`
- `Update: aggiornamento esistente`
- `Refactor: refactoring senza cambiamenti funzionali`
- `Docs: modifiche alla documentazione`

### Branch

- `feature/descrizione` per nuove funzionalità
- `fix/descrizione` per correzioni
- `docs/descrizione` per documentazione

## Licenza

Contribuendo a questo progetto, accetti che i tuoi contributi vengano distribuiti sotto la stessa
licenza del progetto: [AGPL-3.0](LICENSE).

## Domande?

Se hai domande o hai bisogno di aiuto, apri una Issue con il tag **question** oppure contattaci
su [relatronica.com](https://relatronica.com).

---

*Grazie per rendere Neuralforming un progetto migliore!* 🙏
