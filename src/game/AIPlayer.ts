import { PlayerState, Dilemma, DilemmaOption, Technology } from './types';
import { Scoring } from './Scoring';

/**
 * Modulo centralizzato per la logica AI dei giocatori simulati
 */
export class AIPlayer {
  /**
   * Strategie AI disponibili
   */
  private static strategies = {
    balanced: 'balanced',      // Bilanciato tra etica e tecnologia
    techFocused: 'techFocused', // Focalizzato sulla tecnologia
    ethicsFocused: 'ethicsFocused', // Focalizzato sull'etica
    aggressive: 'aggressive',    // Massimizza Neuralforming rapidamente
  };

  /**
   * Determina la strategia di un giocatore AI basandosi sul suo stato attuale
   */
  private static getStrategy(player: PlayerState): string {
    const balance = Scoring.calculateBalance(player);
    
    // Se è molto sbilanciato, cerca di bilanciare
    if (balance < 0.3) {
      if (player.techPoints > player.ethicsPoints) {
        return this.strategies.ethicsFocused;
      } else {
        return this.strategies.techFocused;
      }
    }
    
    // Se è vicino alla vittoria, diventa aggressivo
    if (player.neuralformingPoints >= 50) {
      return this.strategies.aggressive;
    }
    
    // Altrimenti bilanciato
    return this.strategies.balanced;
  }

  /**
   * Sceglie quale tecnologia aggiungere alla IA
   */
  static chooseTechnology(player: PlayerState, availableTechnologies: Technology[]): Technology | null {
    if (availableTechnologies.length === 0) return null;

    const strategy = this.getStrategy(player);

    switch (strategy) {
      case this.strategies.ethicsFocused:
        // Preferisce tecnologie con punti etici
        return availableTechnologies.reduce((best, current) => {
          const currentEthics = current.ethicsPoints || 0;
          const bestEthics = best.ethicsPoints || 0;
          if (currentEthics > bestEthics) return current;
          if (currentEthics === bestEthics && current.neuralformingPoints > best.neuralformingPoints) return current;
          return best;
        });

      case this.strategies.techFocused:
        // Preferisce tecnologie con più punti tecnologia
        return availableTechnologies.reduce((best, current) => {
          if (current.techPoints > best.techPoints) return current;
          if (current.techPoints === best.techPoints && current.neuralformingPoints > best.neuralformingPoints) return current;
          return best;
        });

      case this.strategies.aggressive:
        // Massimizza Neuralforming, ma considera anche il bisogno di tecnologie
        // Se ha meno di 5 tecnologie, preferisce carte tecnologia normali
        if (player.technologies.length < 5) {
          const normalTechs = availableTechnologies.filter(t => t.type !== 'joker');
          if (normalTechs.length > 0) {
            return normalTechs.reduce((best, current) => {
              return current.neuralformingPoints > best.neuralformingPoints ? current : best;
            });
          }
        }
        // Altrimenti massimizza Neuralforming
        return availableTechnologies.reduce((best, current) => {
          return current.neuralformingPoints > best.neuralformingPoints ? current : best;
        });

      default: // balanced
        // Bilanciato: preferisce tecnologie che danno sia tech che ethics
        return availableTechnologies.reduce((best, current) => {
          const currentTotal = current.techPoints + (current.ethicsPoints || 0);
          const bestTotal = best.techPoints + (best.ethicsPoints || 0);
          if (currentTotal > bestTotal) return current;
          if (currentTotal === bestTotal && current.neuralformingPoints > best.neuralformingPoints) return current;
          return best;
        });
    }
  }

  /**
   * Sceglie quale opzione selezionare per un dilemma
   */
  static chooseDilemmaOption(player: PlayerState, dilemma: Dilemma): DilemmaOption {
    const strategy = this.getStrategy(player);

    switch (strategy) {
      case this.strategies.ethicsFocused:
        // Preferisce opzioni con più punti etici
        return dilemma.options.reduce((best, current) => {
          if (current.ethicsPoints > best.ethicsPoints) return current;
          if (current.ethicsPoints === best.ethicsPoints && current.neuralformingPoints > best.neuralformingPoints) return current;
          return best;
        });

      case this.strategies.techFocused:
        // Preferisce opzioni con più punti tecnologia
        return dilemma.options.reduce((best, current) => {
          if (current.techPoints > best.techPoints) return current;
          if (current.techPoints === best.techPoints && current.neuralformingPoints > best.neuralformingPoints) return current;
          return best;
        });

      case this.strategies.aggressive:
        // Massimizza Neuralforming
        return dilemma.options.reduce((best, current) => {
          return current.neuralformingPoints > best.neuralformingPoints ? current : best;
        });

      default: // balanced
        // Bilanciato: preferisce opzioni che bilanciano tech ed ethics
        return dilemma.options.reduce((best, current) => {
          const currentBalance = Math.min(current.techPoints, current.ethicsPoints);
          const bestBalance = Math.min(best.techPoints, best.ethicsPoints);
          const currentTotal = current.techPoints + current.ethicsPoints;
          const bestTotal = best.techPoints + best.ethicsPoints;
          
          if (currentBalance > bestBalance) return current;
          if (currentBalance === bestBalance && currentTotal > bestTotal) return current;
          if (currentBalance === bestBalance && currentTotal === bestTotal && 
              current.neuralformingPoints > best.neuralformingPoints) return current;
          return best;
        });
    }
  }

  /**
   * Simula un turno completo per un giocatore AI
   */
  static async simulateAITurn(
    player: PlayerState,
    drawTechnology: () => Technology | null,
    drawDilemma: () => Dilemma | null,
    availableTechnologies: Technology[]
  ): Promise<{
    technologyAdded: Technology | null;
    dilemmaOption: DilemmaOption | null;
    dilemma: Dilemma | null;
  }> {
    // Simula un piccolo delay per rendere più realistico
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Fase sviluppo: scegli una tecnologia
    let technologyAdded: Technology | null = null;
    if (availableTechnologies.length > 0) {
      technologyAdded = this.chooseTechnology(player, availableTechnologies);
    } else {
      // Pesca una carta se non ha tecnologie disponibili
      const drawn = drawTechnology();
      if (drawn) {
        technologyAdded = this.chooseTechnology(player, [drawn]);
      }
    }

    // Fase dilemma: pesca e risolve
    const dilemma = drawDilemma();
    let dilemmaOption: DilemmaOption | null = null;
    if (dilemma) {
      dilemmaOption = this.chooseDilemmaOption(player, dilemma);
    }

    return {
      technologyAdded,
      dilemmaOption,
      dilemma,
    };
  }
}

