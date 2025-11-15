export interface Dilemma {
  id: string;
  title: string;
  description: string;
  options: DilemmaOption[];
}

export interface DilemmaOption {
  text: string;
  ethicsPoints: number;
  techPoints: number;
  neuralformingPoints: number;
  consequence: string;
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  techPoints: number;
  ethicsPoints?: number;
  neuralformingPoints: number;
  type?: 'technology' | 'joker';
  jokerEffect?: {
    multiplier?: {
      techPoints?: number;
      ethicsPoints?: number;
      neuralformingPoints?: number;
    };
    bonus?: {
      techPoints?: number;
      ethicsPoints?: number;
      neuralformingPoints?: number;
    };
  };
}

export interface Consequence {
  id: string;
  title: string;
  description: string;
  effect: {
    ethicsPoints?: number;
    techPoints?: number;
    neuralformingPoints?: number;
  };
}

export interface PlayerState {
  id: string;
  name: string;
  isAI: boolean;
  techPoints: number;
  ethicsPoints: number;
  neuralformingPoints: number;
  technologies: Technology[];
  hand: Technology[];
  unlockedMilestones: string[]; // ID dei milestone sbloccati
  color?: string; // Colore scelto dal giocatore
  icon?: string; // Icona scelta dal giocatore
}

export type GamePhase = 'development' | 'dilemma' | 'consequence' | 'gameOver' | 'aiTurn';

// Tipo per il risultato della votazione parlamentare
// Definito qui per evitare dipendenze circolari
export interface VoteResult {
  votesFor: number;
  votesAgainst: number;
  approvalRate: number;
  supporters: string[];
  opponents: string[];
}

// Tipo per evento globale
export interface GlobalEventInfo {
  id: string;
  title: string;
  description: string;
}

// Tipo per milestone sbloccato (per UI)
export interface MilestoneUnlocked {
  milestoneId: string;
  playerId: string;
}

export interface GameState {
  players: PlayerState[];
  currentPlayerId: string;
  currentPhase: GamePhase;
  currentDilemma: Dilemma | null;
  currentConsequence: Consequence | null;
  technologyDeck: Technology[];
  dilemmaDeck: Dilemma[];
  turn: number;
  gameWon: boolean;
  gameLost: boolean;
  winnerId: string | null;
  activeJoker: Technology | null; // Jolly attivo per il dilemma corrente
  lastVoteResult?: VoteResult | null; // Risultato dell'ultima votazione parlamentare
  lastVoteMessage?: string | null; // Messaggio dell'ultima votazione
  currentGlobalEvent?: GlobalEventInfo | null; // Evento globale attivo
  newlyUnlockedMilestones?: MilestoneUnlocked[] | null; // Milestone appena sbloccati (per mostrare notifica)
}

