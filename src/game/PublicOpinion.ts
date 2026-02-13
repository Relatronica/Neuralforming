import { Technology, DilemmaOption, Consequence } from './types';
import { 
  PublicOpinionState, 
  OpinionModifier, 
  OpinionReactionResult 
} from './singlePlayerTypes';

/**
 * Sistema di Opinione Pubblica per il Single Player.
 * 
 * Sostituisce il sistema di votazione parlamentare (multiplayer).
 * L'opinione pubblica è un valore 0-100 che reagisce alle scelte del giocatore
 * e influenza l'efficacia delle sue azioni.
 * 
 * Fasce:
 *   >70   : Consenso alto — bonus punti +20%, eventi positivi
 *   40-70 : Neutro — nessun modificatore
 *   20-40 : Consenso basso — penalità punti -15%, eventi negativi
 *   <20   : Crisi — rischio game over, tecnologie possono essere rifiutate
 */
export class PublicOpinion {

  // ============================================================
  // Inizializzazione
  // ============================================================

  /**
   * Crea lo stato iniziale dell'opinione pubblica
   */
  static createInitialState(): PublicOpinionState {
    return {
      value: 50,
      trend: 'stable',
      history: [50],
      modifiers: [],
      consecutiveLowTurns: 0,
    };
  }

  // ============================================================
  // Reazione alla tecnologia proposta
  // ============================================================

  /**
   * Calcola la reazione dell'opinione pubblica a una tecnologia proposta.
   * Restituisce il nuovo stato dell'opinione e il risultato della reazione.
   */
  static reactToTechnology(
    opinion: PublicOpinionState,
    technology: Technology,
  ): { newOpinion: PublicOpinionState; reaction: OpinionReactionResult } {
    const previousValue = opinion.value;
    
    // Calcola il cambiamento base basato sul bilanciamento della tecnologia
    let change = this.calculateTechOpinionChange(technology);
    
    // Applica variabilità (±15% randomness)
    const randomFactor = 1 + (Math.random() - 0.5) * 0.3;
    change = Math.round(change * randomFactor);
    
    // Calcola il nuovo valore (clamp 0-100)
    const newValue = Math.max(0, Math.min(100, previousValue + change));
    
    // Determina se la tecnologia viene respinta (opinione troppo bassa)
    const isRejected = newValue < 15 && change < 0;
    
    // Calcola il moltiplicatore di efficacia
    const effectivenessMultiplier = this.getEffectivenessMultiplier(newValue);
    
    // Genera il messaggio narrativo
    const message = this.generateTechReactionMessage(technology, change, newValue, isRejected);
    
    // Aggiorna lo stato
    const newOpinion: PublicOpinionState = {
      ...opinion,
      value: newValue,
      trend: this.calculateTrend(previousValue, newValue),
      history: [...opinion.history, newValue],
    };
    
    const reaction: OpinionReactionResult = {
      previousOpinion: previousValue,
      newOpinion: newValue,
      change,
      effectivenessMultiplier,
      message,
      isRejected,
    };
    
    return { newOpinion, reaction };
  }

  /**
   * Calcola il cambiamento di opinione per una tecnologia.
   * Tecnologie bilanciate o etiche → opinione sale
   * Tecnologie solo tech → opinione scende
   */
  private static calculateTechOpinionChange(technology: Technology): number {
    const techPts = technology.techPoints;
    const ethicsPts = technology.ethicsPoints || 0;
    
    // Joker: impatto neutro sull'opinione
    if (technology.type === 'joker') {
      return 0;
    }
    
    // Calcola il bilanciamento della tecnologia
    const total = techPts + ethicsPts;
    if (total === 0) return 0;
    
    const ethicsRatio = ethicsPts / total;
    
    // Tecnologia molto etica (>60% ethics): opinione sale
    if (ethicsRatio >= 0.6) {
      return Math.round(3 + ethicsPts * 0.3);
    }
    
    // Tecnologia bilanciata (30-60% ethics): opinione sale leggermente
    if (ethicsRatio >= 0.3) {
      return Math.round(1 + Math.min(techPts, ethicsPts) * 0.15);
    }
    
    // Tecnologia solo tech (<30% ethics): opinione scende
    if (ethicsPts === 0) {
      return -Math.round(2 + techPts * 0.2);
    }
    
    return -Math.round(1 + techPts * 0.1);
  }

  // ============================================================
  // Effetti del dilemma sull'opinione
  // ============================================================

  /**
   * Calcola l'effetto di una scelta di dilemma sull'opinione pubblica
   */
  static applyDilemmaEffect(
    opinion: PublicOpinionState,
    option: DilemmaOption,
  ): PublicOpinionState {
    const previousValue = opinion.value;
    
    // L'effetto dipende dal bilanciamento della scelta
    let change = 0;
    
    if (option.ethicsPoints > option.techPoints) {
      // Scelta etica → opinione sale
      change = Math.round(2 + option.ethicsPoints * 0.25);
    } else if (option.techPoints > option.ethicsPoints * 2) {
      // Scelta molto tech-aggressiva → opinione scende
      change = -Math.round(2 + option.techPoints * 0.15);
    } else {
      // Scelta bilanciata → lieve aumento
      change = Math.round(1 + option.neuralformingPoints * 0.1);
    }
    
    // Applica variabilità
    const randomFactor = 1 + (Math.random() - 0.5) * 0.2;
    change = Math.round(change * randomFactor);
    
    const newValue = Math.max(0, Math.min(100, previousValue + change));
    
    return {
      ...opinion,
      value: newValue,
      trend: this.calculateTrend(previousValue, newValue),
      history: [...opinion.history, newValue],
    };
  }

  // ============================================================
  // Effetti delle conseguenze
  // ============================================================

  /**
   * Applica l'effetto di una conseguenza sull'opinione pubblica.
   * Le conseguenze aggiungono modificatori temporanei.
   */
  static applyConsequenceEffect(
    opinion: PublicOpinionState,
    consequence: Consequence,
  ): PublicOpinionState {
    const effect = consequence.effect;
    
    // Calcola l'impatto sull'opinione basato sull'effetto della conseguenza
    let opinionImpact = 0;
    
    if (effect.ethicsPoints && effect.ethicsPoints > 0) {
      opinionImpact += effect.ethicsPoints * 0.5;
    }
    if (effect.ethicsPoints && effect.ethicsPoints < 0) {
      opinionImpact += effect.ethicsPoints * 0.8; // Penalità etiche pesano di più
    }
    if (effect.techPoints && effect.techPoints > 0) {
      opinionImpact -= effect.techPoints * 0.2; // Tech alto non piace sempre
    }
    
    // Crea un modifier temporaneo (dura 2 turni)
    const modifier: OpinionModifier = {
      source: consequence.title,
      amount: Math.round(opinionImpact),
      turnsRemaining: 2,
    };
    
    // Applica l'impatto immediato
    const newValue = Math.max(0, Math.min(100, opinion.value + Math.round(opinionImpact)));
    
    return {
      ...opinion,
      value: newValue,
      trend: this.calculateTrend(opinion.value, newValue),
      history: [...opinion.history, newValue],
      modifiers: opinionImpact !== 0 
        ? [...opinion.modifiers, modifier] 
        : opinion.modifiers,
    };
  }

  // ============================================================
  // Tick dei modificatori (chiamato a fine turno)
  // ============================================================

  /**
   * Processa i modificatori temporanei a fine turno.
   * Riduce la durata e rimuove quelli scaduti.
   */
  static tickModifiers(opinion: PublicOpinionState): PublicOpinionState {
    let totalModifierEffect = 0;
    
    // Applica l'effetto dei modifier attivi
    const updatedModifiers: OpinionModifier[] = [];
    for (const mod of opinion.modifiers) {
      if (mod.turnsRemaining > 1) {
        totalModifierEffect += mod.amount;
        updatedModifiers.push({
          ...mod,
          turnsRemaining: mod.turnsRemaining - 1,
        });
      }
      // Se turnsRemaining === 1, il modifier scade e non viene più applicato
    }
    
    const newValue = Math.max(0, Math.min(100, opinion.value + totalModifierEffect));
    
    // Aggiorna consecutiveLowTurns
    let consecutiveLow = opinion.consecutiveLowTurns;
    if (newValue < 15) {
      consecutiveLow += 1;
    } else {
      consecutiveLow = 0;
    }
    
    return {
      ...opinion,
      value: newValue,
      trend: this.calculateTrend(opinion.value, newValue),
      history: [...opinion.history, newValue],
      modifiers: updatedModifiers,
      consecutiveLowTurns: consecutiveLow,
    };
  }

  // ============================================================
  // Moltiplicatore di efficacia
  // ============================================================

  /**
   * Calcola il moltiplicatore di efficacia basato sull'opinione pubblica.
   * Influenza quanti punti il giocatore riceve per le sue azioni.
   * 
   *   >70  : +20% (bonus)
   *   40-70: 100% (neutro)
   *   20-40: -15% (penalità)
   *   <20  : -30% (crisi)
   */
  static getEffectivenessMultiplier(opinionValue: number): number {
    if (opinionValue > 70) {
      return 1.20;
    }
    if (opinionValue >= 40) {
      return 1.0;
    }
    if (opinionValue >= 20) {
      return 0.85;
    }
    return 0.70;
  }

  /**
   * Restituisce la fascia dell'opinione pubblica come stringa
   */
  static getOpinionBand(opinionValue: number): 'high' | 'neutral' | 'low' | 'crisis' {
    if (opinionValue > 70) return 'high';
    if (opinionValue >= 40) return 'neutral';
    if (opinionValue >= 20) return 'low';
    return 'crisis';
  }

  // ============================================================
  // Utilità
  // ============================================================

  /**
   * Calcola la tendenza tra due valori
   */
  private static calculateTrend(
    previousValue: number, 
    newValue: number
  ): 'rising' | 'falling' | 'stable' {
    const diff = newValue - previousValue;
    if (diff > 1) return 'rising';
    if (diff < -1) return 'falling';
    return 'stable';
  }

  /**
   * Genera un messaggio narrativo per la reazione alla tecnologia
   */
  private static generateTechReactionMessage(
    technology: Technology,
    change: number,
    newValue: number,
    isRejected: boolean,
  ): string {
    if (isRejected) {
      return `L'opinione pubblica è crollata! La proposta "${technology.name}" è stata respinta con indignazione. Il consenso è troppo basso per procedere.`;
    }
    
    if (change >= 5) {
      return `La proposta "${technology.name}" ha ricevuto un'accoglienza entusiasta dal pubblico! L'opinione pubblica sale a ${newValue}.`;
    }
    
    if (change >= 2) {
      return `"${technology.name}" è stata accolta positivamente. L'opinione pubblica migliora leggermente (${newValue}).`;
    }
    
    if (change >= 0) {
      return `"${technology.name}" è stata approvata senza particolari reazioni. L'opinione pubblica resta stabile (${newValue}).`;
    }
    
    if (change >= -3) {
      return `La proposta "${technology.name}" ha generato qualche perplessità nell'opinione pubblica (${newValue}).`;
    }
    
    return `"${technology.name}" ha suscitato forti critiche dall'opinione pubblica. Il consenso cala significativamente (${newValue}).`;
  }
}
