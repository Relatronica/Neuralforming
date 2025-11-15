# 🧠 Neuralforming

Un gioco educativo web che simula lo sviluppo di un'intelligenza artificiale bilanciando tecnologia avanzata ed etica.

## 🎯 Obiettivo del Gioco

Assumi il ruolo di un Politico che lavora con un team di sviluppatori per "formare" un'intelligenza artificiale. L'obiettivo è costruire la IA più avanzata ed eticamente equilibrata, affrontando dilemmi morali e situazioni complesse lungo il cammino.

## 🎮 Come Giocare

### Fasi del Turno

Ogni turno è diviso in 3 fasi:

1. **Sviluppo**: Pesca una carta "Tecnologia" e aggiungila alla tua IA per migliorare le sue capacità.

2. **Dilemma Etico**: Affronta un dilemma etico e scegli tra 2-3 opzioni, ognuna con diverse implicazioni.

3. **Conseguenze**: Scopri gli effetti a lungo termine delle tue decisioni.

### Meccaniche di Gioco

- **Punti Tecnologia**: Guadagnati dalle carte tecnologia
- **Punti Etica**: Guadagnati dalle scelte etiche nei dilemmi
- **Punti Neuralforming**: Punteggio complessivo che combina tecnologia ed etica

### Condizioni di Vittoria

Il gioco termina quando:
- ✅ **Vittoria**: Raggiungi almeno 50 punti Neuralforming E almeno 25 punti Etica
- ❌ **Sconfitta**: Raggiungi 50+ punti Neuralforming ma meno di 25 punti Etica (IA inaccettabile)

## 🚀 Installazione e Avvio

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Preview della build
npm run preview
```

## 🛠️ Tecnologie Utilizzate

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool veloce
- **Tailwind CSS** - Styling moderno e responsive

## 📁 Struttura del Progetto

```
src/
├── components/        # Componenti React
│   ├── Board/        # Tabellone di gioco
│   ├── Cards/        # Componenti carte
│   ├── Dashboard/    # Dashboard punteggi
│   └── Game/         # Componente principale del gioco
├── data/             # Dati delle carte (JSON)
│   ├── dilemmas.json
│   ├── technologies.json
│   └── consequences.json
├── game/             # Logica di gioco
│   ├── GameEngine.ts
│   ├── Scoring.ts
│   ├── TurnManager.ts
│   └── types.ts
├── App.tsx           # Componente principale
└── main.tsx          # Entry point
```

## 🎨 Caratteristiche

- ✅ Interfaccia moderna e responsive
- ✅ Sistema di punteggi bilanciato
- ✅ 8 dilemmi etici complessi
- ✅ 15 tecnologie diverse
- ✅ Sistema di conseguenze dinamico
- ✅ Design educativo e intuitivo

## 📝 Licenza

Questo progetto è un gioco educativo open source.

