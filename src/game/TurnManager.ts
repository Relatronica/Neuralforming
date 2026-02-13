import { GameState, GamePhase, Dilemma, Consequence } from './types';
import { Scoring } from './Scoring';
import { GameEngine } from './GameEngine';
import { milestones } from './Milestones';

/**
 * Modulo centralizzato per la gestione dei turni e delle fasi di gioco
 */
export class TurnManager {
  /**
   * Avanza alla fase successiva del turno
   */
  static advancePhase(gameState: GameState): GameState {
    const phases: GamePhase[] = ['development', 'dilemma', 'consequence'];
    const currentIndex = phases.indexOf(gameState.currentPhase);
    
    if (currentIndex < phases.length - 1) {
      return {
        ...gameState,
        currentPhase: phases[currentIndex + 1],
      };
    } else {
      // Fine turno, passa al prossimo giocatore
      return this.nextPlayer(gameState);
    }
  }

  /**
   * Passa al prossimo giocatore
   * Gestisce anche l'abilità extra-card per pescare automaticamente una carta
   */
  static nextPlayer(gameState: GameState): GameState {
    const currentIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextIndex];

    let newGameState: GameState = {
      ...gameState,
      currentPlayerId: nextPlayer.id,
      currentPhase: 'development',
      currentDilemma: null,
      currentConsequence: null,
      resolvedDilemmaOption: null, // Reset quando si passa al prossimo giocatore
      turn: nextIndex === 0 ? gameState.turn + 1 : gameState.turn,
      newlyUnlockedMilestones: null, // Reset milestone appena sbloccati
    };

    // Applica l'abilità extra-card se il giocatore ha il milestone
    const playerMilestones = milestones.filter(m => 
      nextPlayer.unlockedMilestones.includes(m.id)
    );
    const hasExtraCard = playerMilestones.some(m => 
      m.ability.effect === 'extra-card'
    );

    if (hasExtraCard) {
      // Pesca automaticamente una carta tecnologia
      newGameState = GameEngine.drawTechnology(newGameState, nextPlayer.id);
    }

    return newGameState;
  }

  /**
   * Inizia la fase di sviluppo
   */
  static startDevelopmentPhase(gameState: GameState): GameState {
    return {
      ...gameState,
      currentPhase: 'development',
    };
  }

  /**
   * Inizia la fase di dilemma
   */
  static startDilemmaPhase(gameState: GameState, dilemma: Dilemma): GameState {
    return {
      ...gameState,
      currentPhase: 'dilemma',
      currentDilemma: dilemma,
      resolvedDilemmaOption: null, // Reset quando viene pescato un nuovo dilemma
    };
  }

  /**
   * Inizia la fase di conseguenze
   */
  static startConsequencePhase(gameState: GameState, consequence: Consequence): GameState {
    return {
      ...gameState,
      currentPhase: 'consequence',
      currentConsequence: consequence,
    };
  }

  /**
   * Verifica condizioni di vittoria/sconfitta e aggiorna lo stato
   */
  static checkGameEnd(gameState: GameState): GameState {
    // Controlla tutti i giocatori
    for (const player of gameState.players) {
      const won = Scoring.checkWinCondition(player);
      if (won) {
        return {
          ...gameState,
          currentPhase: 'gameOver',
          gameWon: true,
          winnerId: player.id,
        };
      }
    }

    // Controlla se qualcuno ha perso (IA inaccettabile)
    const humanPlayer = gameState.players.find(p => !p.isAI);
    if (humanPlayer) {
      const lost = Scoring.checkLoseCondition(humanPlayer);
      if (lost) {
        // Trova il vincitore tra gli altri giocatori
        const validWinners = gameState.players
          .filter(p => p.id !== humanPlayer.id)
          .filter(p => Scoring.checkWinCondition(p) || p.neuralformingPoints >= 50);
        
        if (validWinners.length > 0) {
          // Il vincitore è quello con il miglior bilanciamento
          const winner = validWinners.reduce((best, current) => {
            const bestBalance = Scoring.calculateBalance(best);
            const currentBalance = Scoring.calculateBalance(current);
            if (currentBalance > bestBalance) return current;
            if (currentBalance === bestBalance && current.neuralformingPoints > best.neuralformingPoints) return current;
            return best;
          });

          return {
            ...gameState,
            currentPhase: 'gameOver',
            gameWon: false,
            gameLost: true,
            winnerId: winner.id,
          };
        }
      }
    }

    return gameState;
  }

  /**
   * Ottiene il giocatore corrente
   */
  static getCurrentPlayer(gameState: GameState) {
    return gameState.players.find(p => p.id === gameState.currentPlayerId);
  }

  /**
   * Rimuove un giocatore dalla partita e aggiusta il turno se necessario
   * Usato quando un giocatore lascia permanentemente la partita
   */
  static removePlayer(gameState: GameState, playerId: string): GameState {
    const remainingPlayers = gameState.players.filter(p => p.id !== playerId);
    
    if (remainingPlayers.length === 0) {
      return {
        ...gameState,
        players: [],
        currentPhase: 'gameOver',
        gameLost: true,
      };
    }

    // Se il giocatore rimosso era il giocatore corrente, avanza al prossimo
    let newCurrentPlayerId = gameState.currentPlayerId;
    let newPhase = gameState.currentPhase;
    let newDilemma = gameState.currentDilemma;
    let newConsequence = gameState.currentConsequence;

    if (gameState.currentPlayerId === playerId) {
      // Trova l'indice del giocatore rimosso nell'array originale
      const removedIndex = gameState.players.findIndex(p => p.id === playerId);
      // Il prossimo giocatore è all'indice corrente (perché il rimosso è sparito)
      const nextIndex = removedIndex % remainingPlayers.length;
      newCurrentPlayerId = remainingPlayers[nextIndex].id;
      newPhase = 'development';
      newDilemma = null;
      newConsequence = null;
    } else {
      // Verifica che il currentPlayerId esista ancora
      const exists = remainingPlayers.some(p => p.id === newCurrentPlayerId);
      if (!exists) {
        newCurrentPlayerId = remainingPlayers[0].id;
        newPhase = 'development';
        newDilemma = null;
        newConsequence = null;
      }
    }

    // Se resta un solo giocatore, vince automaticamente
    if (remainingPlayers.length === 1) {
      return {
        ...gameState,
        players: remainingPlayers,
        currentPlayerId: remainingPlayers[0].id,
        currentPhase: 'gameOver',
        gameWon: true,
        winnerId: remainingPlayers[0].id,
      };
    }

    return {
      ...gameState,
      players: remainingPlayers,
      currentPlayerId: newCurrentPlayerId,
      currentPhase: newPhase,
      currentDilemma: newDilemma,
      currentConsequence: newConsequence,
    };
  }
}
