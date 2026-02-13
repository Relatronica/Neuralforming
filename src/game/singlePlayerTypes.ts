import { 
  Technology, 
  Dilemma, 
  DilemmaOption, 
  Consequence, 
  PlayerState, 
  SocietyNews,
  GlobalEventInfo,
  MilestoneUnlocked,
} from './types';

// ============================================================
// Single Player - Tipi dedicati
// ============================================================

/**
 * Fasi del gioco single player.
 * A differenza del multiplayer, non esistono turni AI.
 * Le fasi sono lineari e guidate dal giocatore.
 */
export type SinglePlayerPhase = 
  | 'development'        // Il giocatore sceglie una tecnologia dalla mano
  | 'opinion_reaction'   // Animazione reazione opinione pubblica
  | 'dilemma'            // Il giocatore affronta un dilemma etico
  | 'consequence'        // Visualizzazione conseguenza
  | 'event'              // News / Global Event (opzionale, tra un turno e l'altro)
  | 'gameOver';          // Fine partita (vittoria o sconfitta)

/**
 * Livello di difficoltà, scala automaticamente con il progresso
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'crisis';

/**
 * Modificatore temporaneo all'opinione pubblica.
 * Viene applicato dalle conseguenze e dura N turni.
 */
export interface OpinionModifier {
  source: string;          // Descrizione della fonte (es. "Conseguenza: Proteste pubbliche")
  amount: number;          // Modifica per turno (positivo o negativo)
  turnsRemaining: number;  // Quanti turni resta attivo
}

/**
 * Stato dell'opinione pubblica.
 * Sostituisce il sistema di votazione parlamentare nel single player.
 */
export interface PublicOpinionState {
  value: number;                              // 0-100, parte da 50
  trend: 'rising' | 'falling' | 'stable';    // Tendenza attuale
  history: number[];                          // Storico valori (per grafico/analisi)
  modifiers: OpinionModifier[];               // Modificatori attivi
  consecutiveLowTurns: number;                // Turni consecutivi sotto soglia critica
}

/**
 * Voce nello storico delle decisioni del giocatore
 */
export interface DecisionHistoryEntry {
  turn: number;
  type: 'technology' | 'dilemma';
  title: string;
  opinionChange: number;                      // Variazione opinione pubblica
  pointsGained: {
    techPoints: number;
    ethicsPoints: number;
    neuralformingPoints: number;
  };
}

/**
 * Risultato della reazione dell'opinione pubblica a una proposta tecnologica.
 * Sostituisce VoteResult del multiplayer.
 */
export interface OpinionReactionResult {
  previousOpinion: number;       // Valore prima della reazione
  newOpinion: number;            // Valore dopo la reazione
  change: number;                // Variazione (+/-)
  effectivenessMultiplier: number; // Moltiplicatore punti basato sull'opinione
  message: string;               // Messaggio narrativo per il giocatore
  isRejected: boolean;           // Se true, la tecnologia viene bocciata (opinione troppo bassa)
}

/**
 * Stato completo del gioco single player.
 * A differenza di GameState, ha un solo giocatore e include l'opinione pubblica.
 */
export interface SinglePlayerState {
  // Giocatore
  player: PlayerState;
  
  // Stato del gioco
  currentPhase: SinglePlayerPhase;
  turn: number;
  
  // Mazzi
  technologyDeck: Technology[];
  dilemmaDeck: Dilemma[];
  
  // Fase corrente
  currentDilemma: Dilemma | null;
  currentConsequence: Consequence | null;
  activeJoker: Technology | null;
  resolvedDilemmaOption: DilemmaOption | null;
  
  // Opinione pubblica (sostituisce il voting)
  publicOpinion: PublicOpinionState;
  lastOpinionReaction: OpinionReactionResult | null;
  
  // Difficoltà
  difficulty: DifficultyLevel;
  
  // Eventi e news
  currentGlobalEvent: GlobalEventInfo | null;
  currentNews: SocietyNews | null;
  lastNewsTurn: number | undefined;
  
  // Milestones
  newlyUnlockedMilestones: MilestoneUnlocked[] | null;
  
  // Fine partita
  gameWon: boolean;
  gameLost: boolean;
  gameOverReason: string | null;
  
  // Storico decisioni (per dashboard)
  decisionHistory: DecisionHistoryEntry[];
}
