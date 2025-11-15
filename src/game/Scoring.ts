import { PlayerState } from './types';

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
   * Vincita bilanciata:
   * - 65 punti Neuralforming (ridotto da 80 per renderlo raggiungibile con penalità votazioni)
   * - 45 punti Ethics (aumentato da 40 per renderlo più sfidante)
   * - 5 tecnologie sviluppate
   * - Bilanciamento minimo 0.5 (aumentato da 0.4 per forzare vero equilibrio)
   */
  static checkWinCondition(player: PlayerState): boolean {
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

