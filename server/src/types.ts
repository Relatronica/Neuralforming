// Copia dei tipi dal client per il server
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
  unlockedMilestones: string[];
}

export type GamePhase = 'development' | 'dilemma' | 'consequence' | 'gameOver' | 'aiTurn';

// Risultato della votazione collettiva sul dilemma etico
export interface DilemmaVoteResult {
  optionIndex: number;
  optionText: string;
  votesPerOption: number[];
  totalVotes: number;
  voterChoices: Array<{ playerId: string; optionIndex: number }>;
}

export interface VoteResult {
  votesFor: number;
  votesAgainst: number;
  approvalRate: number;
  supporters: string[];
  opponents: string[];
}

export interface GlobalEventInfo {
  id: string;
  title: string;
  description: string;
}

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
  activeJoker: Technology | null;
  lastVoteResult?: VoteResult | null;
  lastVoteMessage?: string | null;
  currentGlobalEvent?: GlobalEventInfo | null;
  newlyUnlockedMilestones?: MilestoneUnlocked[] | null;
  resolvedDilemmaOption?: DilemmaOption | null; // Opzione scelta per il dilemma corrente (mostra le risposte nel tabellone)
  lastDilemmaVoteResult?: DilemmaVoteResult | null; // Risultato dell'ultima votazione sul dilemma
}

