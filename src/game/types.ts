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

// Risultato della votazione collettiva sul dilemma etico
export interface DilemmaVoteResult {
  optionIndex: number; // Indice dell'opzione vincente
  optionText: string; // Testo dell'opzione vincente
  votesPerOption: number[]; // Voti ricevuti per ogni opzione
  totalVotes: number;
  voterChoices: Array<{ playerId: string; optionIndex: number }>; // Come ha votato ogni giocatore
}

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

// Tipo per obiettivo del giocatore
export interface PlayerObjective {
  id: string;
  title: string;
  description: string;
  requirements: {
    techPoints?: number;
    ethicsPoints?: number;
    neuralformingPoints?: number;
    technologiesCount?: number;
    balance?: number; // Bilanciamento minimo richiesto
  };
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'tech' | 'ethics' | 'balanced' | 'neural';
}

// Tipo per news dalla società
export interface SocietyNews {
  id: string;
  title: string;
  description: string;
  effect: {
    techPoints?: number; // Modifica punti per tutti i giocatori (o selettiva)
    ethicsPoints?: number;
    neuralformingPoints?: number;
  };
  targets?: 'all' | 'current' | 'others'; // Chi viene colpito dalla news
  category: 'tech' | 'ethics' | 'neutral' | 'crisis' | 'breakthrough';
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
  objectiveId?: string; // ID dell'obiettivo assegnato al giocatore
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
  currentNews?: SocietyNews | null; // News corrente dalla società
  lastNewsTurn?: number; // Turno in cui è apparsa l'ultima news
  resolvedDilemmaOption?: DilemmaOption | null; // Opzione scelta per il dilemma corrente (mostra le risposte nel tabellone)
  lastDilemmaVoteResult?: DilemmaVoteResult | null; // Risultato dell'ultima votazione sul dilemma
  voterPointsInfo?: Array<{
    playerId: string;
    vote: boolean;
    points: {
      techPoints: number;
      ethicsPoints: number;
      neuralformingPoints: number;
    };
    isApproved: boolean;
  }> | null; // Punti ricevuti dai votanti nell'ultima votazione
}

