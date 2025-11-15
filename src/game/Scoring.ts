import { PlayerState } from './types';
import { Objectives } from './Objectives';

/**
 * Modulo centralizzato per la gestione del sistema di punteggi
 */
export class Scoring {
  /**
   * Calcola il punteggio totale Neuralforming
   */
  static calculateNeuralformingPoints(player: PlayerState): number {
    return player.neuralformingPoints;
  }

  /**
   * Verifica se il giocatore ha vinto
   * Se il giocatore ha un obiettivo assegnato, verifica quello
   * Altrimenti usa la condizione di vittoria standard (per retrocompatibilità)
   */
  static checkWinCondition(player: PlayerState): boolean {
    // Se il giocatore ha un obiettivo, verifica quello
    if (player.objectiveId) {
      return Objectives.checkObjectiveCompletion(player, player.objectiveId);
    }
    
    // Condizione di vittoria standard (per retrocompatibilità)
    const hasEnoughNeuralforming = player.neuralformingPoints >= 65;
    const hasEnoughEthics = player.ethicsPoints >= 45;
    const hasEnoughTechnologies = player.technologies.length >= 5;
    const hasGoodBalance = this.calculateBalance(player) >= 0.5;
    return hasEnoughNeuralforming && hasEnoughEthics && hasEnoughTechnologies && hasGoodBalance;
  }

  /**
   * Verifica se il giocatore ha perso
   * Perdita: più di 65 punti Neuralforming ma meno di 45 punti etici
   * O bilanciamento troppo scarso (< 0.25) con Neuralforming >= 50
   */
  static checkLoseCondition(player: PlayerState): boolean {
    const hasEnoughNeuralforming = player.neuralformingPoints >= 65;
    const hasInsufficientEthics = player.ethicsPoints < 45;
    const hasPoorBalance = this.calculateBalance(player) < 0.25 && player.neuralformingPoints >= 50;
    return (hasEnoughNeuralforming && hasInsufficientEthics) || hasPoorBalance;
  }

  /**
   * Calcola il bilanciamento tra tecnologia ed etica
   * Ritorna un valore tra 0 e 1 (1 = perfettamente bilanciato)
   */
  static calculateBalance(player: PlayerState): number {
    const total = player.techPoints + player.ethicsPoints;
    if (total === 0) return 0;
    
    const ratio = Math.min(player.techPoints, player.ethicsPoints) / 
                  Math.max(player.techPoints, player.ethicsPoints);
    return ratio;
  }

  /**
   * Aggiunge punti al giocatore
   */
  static addPoints(
    player: PlayerState,
    points: {
      techPoints?: number;
      ethicsPoints?: number;
      neuralformingPoints?: number;
    }
  ): PlayerState {
    return {
      ...player,
      techPoints: player.techPoints + (points.techPoints || 0),
      ethicsPoints: player.ethicsPoints + (points.ethicsPoints || 0),
      neuralformingPoints: player.neuralformingPoints + (points.neuralformingPoints || 0),
    };
  }
}

