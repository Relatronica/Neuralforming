# Player App (PWA)

App mobile semplificata per i giocatori di Neuralforming.

## Funzionalità

- **Login**: I giocatori inseriscono l'ID della partita e il loro nome
- **Votazioni**: Quando un altro giocatore propone una tecnologia, i giocatori possono votare
- **Proposte**: Quando è il loro turno, i giocatori possono vedere e selezionare proposte di legge
- **Dilemmi**: Quando è il loro turno, i giocatori risolvono i dilemmi etici
- **Conseguenze**: Visualizzazione delle conseguenze delle loro decisioni

## Accesso

L'app è disponibile all'indirizzo: `http://localhost:5173/player`

## Come usare

1. Il master crea una partita nell'app principale
2. I giocatori aprono `/player` sul loro smartphone
3. Inseriscono l'ID della partita e il loro nome
4. Si uniscono automaticamente alla partita
5. Quando è il loro turno o devono votare, vedono le schermate appropriate

## Note

- L'app si connette allo stesso server WebSocket dell'app principale
- Usa lo stesso sistema di autenticazione (roomId + playerName)
- Mostra solo le azioni rilevanti per il giocatore corrente

