import { Dilemma, SocietyNews } from './types';
import { DifficultyLevel, SinglePlayerState } from './singlePlayerTypes';
import newsData from '../data/news.json';

/**
 * Gestione della difficoltà progressiva per il Single Player.
 * 
 * La difficoltà scala automaticamente in base al turno e ai punti del giocatore.
 * Influenza:
 *   - Quali dilemmi vengono pescati (più complessi con difficoltà maggiore)
 *   - Il moltiplicatore punti delle conseguenze
 *   - La frequenza degli eventi globali
 *   - Il numero di carte pescate
 * 
 * Livelli:
 *   easy   (turni 1-3):  Dilemmi semplici, punti generosi
 *   medium (turni 4-7):  Dilemmi complessi, margini ridotti
 *   hard   (turni 8-10): Crisi, scelte difficili
 *   crisis (turno 11+):  Eventi frequenti, opinione volatile
 */
export class DifficultyManager {

  // ============================================================
  // Calcolo del livello di difficoltà
  // ============================================================

  /**
   * Determina il livello di difficoltà corrente basato sullo stato del gioco.
   * Tiene conto del turno, dei punti, e dell'opinione pubblica.
   */
  static calculateDifficulty(state: SinglePlayerState): DifficultyLevel {
    const { turn, player, publicOpinion } = state;
    
    // Base: difficoltà per turno
    let baseDifficulty: DifficultyLevel;
    if (turn <= 3) {
      baseDifficulty = 'easy';
    } else if (turn <= 7) {
      baseDifficulty = 'medium';
    } else if (turn <= 10) {
      baseDifficulty = 'hard';
    } else {
      baseDifficulty = 'crisis';
    }
    
    // Accelerazione: se il giocatore sta andando troppo bene, aumenta la difficoltà
    if (player.neuralformingPoints >= 40 && baseDifficulty === 'easy') {
      baseDifficulty = 'medium';
    }
    if (player.neuralformingPoints >= 55 && baseDifficulty === 'medium') {
      baseDifficulty = 'hard';
    }
    
    // Deescalation: se l'opinione pubblica è in crisi, non aumentare troppo
    if (publicOpinion.value < 20 && baseDifficulty === 'crisis') {
      baseDifficulty = 'hard'; // Non infierire troppo
    }
    
    return baseDifficulty;
  }

  // ============================================================
  // Filtro dilemmi per difficoltà
  // ============================================================

  /**
   * Filtra e ordina i dilemmi in base alla difficoltà corrente.
   * I dilemmi "difficili" sono quelli con differenze maggiori tra le opzioni.
   */
  static filterDilemmasByDifficulty(
    dilemmas: Dilemma[], 
    difficulty: DifficultyLevel
  ): Dilemma[] {
    if (dilemmas.length === 0) return [];
    
    // Calcola la "complessità" di ogni dilemma
    // Dilemmi più complessi = opzioni con trade-off più estremi
    const scored = dilemmas.map(dilemma => {
      const complexity = this.calculateDilemmaComplexity(dilemma);
      return { dilemma, complexity };
    });
    
    // Ordina per complessità
    scored.sort((a, b) => a.complexity - b.complexity);
    
    // Seleziona la porzione appropriata in base alla difficoltà
    const total = scored.length;
    let startRatio: number;
    let endRatio: number;
    
    switch (difficulty) {
      case 'easy':
        startRatio = 0;
        endRatio = 0.4;  // Il 40% più facile
        break;
      case 'medium':
        startRatio = 0.2;
        endRatio = 0.7;  // Il range medio
        break;
      case 'hard':
        startRatio = 0.5;
        endRatio = 1.0;  // Il 50% più difficile
        break;
      case 'crisis':
        startRatio = 0.6;
        endRatio = 1.0;  // Solo i più difficili
        break;
    }
    
    const startIdx = Math.floor(total * startRatio);
    const endIdx = Math.ceil(total * endRatio);
    
    return scored.slice(startIdx, endIdx).map(s => s.dilemma);
  }

  /**
   * Calcola la complessità di un dilemma.
   * Più alto = più complesso (trade-off più estremi tra le opzioni).
   */
  private static calculateDilemmaComplexity(dilemma: Dilemma): number {
    if (dilemma.options.length <= 1) return 0;
    
    let maxDiff = 0;
    
    for (let i = 0; i < dilemma.options.length; i++) {
      for (let j = i + 1; j < dilemma.options.length; j++) {
        const a = dilemma.options[i];
        const b = dilemma.options[j];
        
        // Differenza tra tech ed ethics per ogni coppia di opzioni
        const techDiff = Math.abs(a.techPoints - b.techPoints);
        const ethicsDiff = Math.abs(a.ethicsPoints - b.ethicsPoints);
        
        // Un dilemma complesso ha opzioni molto diverse
        maxDiff = Math.max(maxDiff, techDiff + ethicsDiff);
      }
    }
    
    return maxDiff;
  }

  // ============================================================
  // Moltiplicatori punti
  // ============================================================

  /**
   * Restituisce il moltiplicatore per i punti delle conseguenze.
   * A difficoltà maggiore, le conseguenze hanno più impatto.
   */
  static getConsequenceMultiplier(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'easy':   return 0.8;    // Conseguenze più leggere
      case 'medium': return 1.0;    // Normale
      case 'hard':   return 1.3;    // Conseguenze più pesanti
      case 'crisis': return 1.5;    // Conseguenze severe
    }
  }

  /**
   * Restituisce il numero di carte da pescare a inizio turno.
   */
  static getCardsToDrawCount(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'easy':   return 3;    // Più scelta
      case 'medium': return 2;    // Normale
      case 'hard':   return 2;    // Normale
      case 'crisis': return 1;    // Risorse limitate
    }
  }

  // ============================================================
  // Frequenza eventi
  // ============================================================

  /**
   * Determina se un evento globale deve attivarsi questo turno.
   */
  static shouldTriggerGlobalEvent(state: SinglePlayerState): boolean {
    const { turn, difficulty } = state;
    
    // Mai al turno 1
    if (turn <= 1) return false;
    
    // Probabilità basata sulla difficoltà
    let probability: number;
    switch (difficulty) {
      case 'easy':   probability = 0.10;  // 10% per turno
        break;
      case 'medium': probability = 0.20;  // 20% per turno
        break;
      case 'hard':   probability = 0.35;  // 35% per turno
        break;
      case 'crisis': probability = 0.50;  // 50% per turno
        break;
    }
    
    return Math.random() < probability;
  }

  /**
   * Determina se una news deve apparire questo turno.
   */
  static shouldShowNews(state: SinglePlayerState): boolean {
    const { turn, lastNewsTurn, difficulty } = state;
    
    // Mai al turno 1
    if (turn <= 1) return false;
    
    // Se non c'è un lastNewsTurn, mostra dopo 2 turni
    if (!lastNewsTurn) {
      return turn >= 2;
    }
    
    // Intervallo tra le news, basato sulla difficoltà
    let interval: number;
    switch (difficulty) {
      case 'easy':   interval = 3;
        break;
      case 'medium': interval = 2;
        break;
      case 'hard':   interval = 2;
        break;
      case 'crisis': interval = 1;  // Ogni turno
        break;
    }
    
    return (turn - lastNewsTurn) >= interval;
  }

  /**
   * Seleziona una news appropriata alla situazione del giocatore.
   * In crisi, le news tendono ad essere negative. Con alta opinione, positive.
   */
  static selectAppropriateNews(state: SinglePlayerState): SocietyNews | null {
    const allNews = newsData as SocietyNews[];
    if (allNews.length === 0) return null;
    
    const { publicOpinion, difficulty } = state;
    
    // Filtra per categoria in base alla situazione
    let preferredCategories: string[];
    
    if (publicOpinion.value > 70) {
      preferredCategories = ['breakthrough', 'tech', 'neutral'];
    } else if (publicOpinion.value < 30) {
      preferredCategories = ['crisis', 'ethics'];
    } else if (difficulty === 'crisis') {
      preferredCategories = ['crisis', 'ethics', 'neutral'];
    } else {
      preferredCategories = ['tech', 'ethics', 'neutral', 'breakthrough', 'crisis'];
    }
    
    // Prova prima le news delle categorie preferite
    const preferred = allNews.filter(n => preferredCategories.includes(n.category));
    const pool = preferred.length > 0 ? preferred : allNews;
    
    // Scegli una news random dal pool
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ============================================================
  // Label di difficoltà per UI
  // ============================================================

  /**
   * Restituisce info per la UI sulla difficoltà corrente
   */
  static getDifficultyInfo(difficulty: DifficultyLevel): {
    label: string;
    color: string;
    description: string;
  } {
    switch (difficulty) {
      case 'easy':
        return {
          label: 'Facile',
          color: 'text-green-400',
          description: 'Situazione stabile. Il parlamento è collaborativo.',
        };
      case 'medium':
        return {
          label: 'Moderata',
          color: 'text-yellow-400',
          description: 'Le scelte si fanno più complesse. Attenzione al bilanciamento.',
        };
      case 'hard':
        return {
          label: 'Difficile',
          color: 'text-orange-400',
          description: 'Crisi in arrivo. Ogni decisione conta.',
        };
      case 'crisis':
        return {
          label: 'Crisi',
          color: 'text-red-400',
          description: 'Situazione critica! L\'opinione pubblica è volatile.',
        };
    }
  }
}
