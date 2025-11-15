import { PlayerState } from './types';
import { Scoring } from './Scoring';

/**
 * Modulo centralizzato per il sistema di milestone
 * Sblocca abilità speciali basate sui progressi del giocatore
 */

export interface Milestone {
  id: string;
  name: string;
  description: string;
  condition: (player: PlayerState) => boolean;
  ability: MilestoneAbility;
}

export interface MilestoneAbility {
  id: string;
  name: string;
  description: string;
  effect: 'voting-bonus' | 'event-protection' | 'double-points' | 'skip-dilemma' | 'extra-card';
  value?: number; // Valore dell'effetto (es. +20% voti)
}

/**
 * Tutti i milestone disponibili nel gioco
 */
export const milestones: Milestone[] = [
  {
    id: 'milestone-tech-pioneer',
    name: 'Pioniere Tecnologico',
    description: 'Raggiungi 30 punti Tecnologia per dimostrare la tua competenza nell\'innovazione.',
    condition: (player) => player.techPoints >= 30,
    ability: {
      id: 'ability-voting-tech',
      name: 'Supporto Tecnologico',
      description: 'Le tecnologie che giochi ricevono +15% di approvazione parlamentare.',
      effect: 'voting-bonus',
      value: 0.15,
    },
  },
  {
    id: 'milestone-ethics-guardian',
    name: 'Guardiano Etico',
    description: 'Raggiungi 25 punti Etica per dimostrare il tuo impegno verso la responsabilità.',
    condition: (player) => player.ethicsPoints >= 25,
    ability: {
      id: 'ability-event-protection',
      name: 'Protezione Etica',
      description: 'Sei protetto dagli effetti negativi degli eventi globali etici.',
      effect: 'event-protection',
    },
  },
  {
    id: 'milestone-balanced-leader',
    name: 'Leader Bilanciato',
    description: 'Mantieni un bilanciamento > 0.6 tra Tecnologia ed Etica per dimostrare equilibrio.',
    condition: (player) => {
      const balance = Scoring.calculateBalance(player);
      return balance >= 0.6 && player.techPoints >= 20 && player.ethicsPoints >= 20;
    },
    ability: {
      id: 'ability-double-points',
      name: 'Sinergia Perfetta',
      description: 'Quando giochi una tecnologia bilanciata (tech ed ethics simili), ricevi +50% punti Neuralforming.',
      effect: 'double-points',
      value: 0.5,
    },
  },
  {
    id: 'milestone-neuralforming-25',
    name: 'Innovatore Neuralforming',
    description: 'Raggiungi 25 punti Neuralforming per dimostrare progressi significativi.',
    condition: (player) => player.neuralformingPoints >= 25,
    ability: {
      id: 'ability-extra-card',
      name: 'Iniziativa Parlamentare',
      description: 'All\'inizio di ogni turno, peschi automaticamente una carta tecnologia extra.',
      effect: 'extra-card',
    },
  },
  {
    id: 'milestone-neuralforming-40',
    name: 'Maestro Neuralforming',
    description: 'Raggiungi 40 punti Neuralforming per diventare un leader riconosciuto.',
    condition: (player) => player.neuralformingPoints >= 40,
    ability: {
      id: 'ability-skip-dilemma',
      name: 'Esenzione Parlamentare',
      description: 'Una volta per partita, puoi saltare un dilemma e ricevere comunque metà dei punti Neuralforming.',
      effect: 'skip-dilemma',
      value: 0.5,
    },
  },
  {
    id: 'milestone-technologies-3',
    name: 'Sviluppatore Esperto',
    description: 'Sviluppa almeno 3 tecnologie per dimostrare la tua capacità di innovazione.',
    condition: (player) => player.technologies.length >= 3,
    ability: {
      id: 'ability-voting-support',
      name: 'Coalizione Tecnologica',
      description: 'I partiti tecnologici sono più propensi a votare a favore delle tue proposte (+10% approvazione).',
      effect: 'voting-bonus',
      value: 0.10,
    },
  },
];

/**
 * Verifica quali milestone un giocatore ha raggiunto
 */
export function checkMilestones(player: PlayerState, unlockedMilestones: string[]): Milestone[] {
  return milestones.filter(
    milestone => 
      milestone.condition(player) && 
      !unlockedMilestones.includes(milestone.id)
  );
}

/**
 * Applica l'effetto di un'abilità milestone alla votazione parlamentare
 */
export function applyMilestoneVotingBonus(
  approvalRate: number,
  _player: PlayerState,
  unlockedAbilities: MilestoneAbility[]
): number {
  let bonus = 0;
  
  // Applica tutti i bonus di votazione
  unlockedAbilities.forEach(ability => {
    if (ability.effect === 'voting-bonus' && ability.value) {
      bonus += ability.value;
    }
  });
  
  return Math.min(1, approvalRate + bonus); // Max 100%
}

/**
 * Verifica se un giocatore è protetto da un evento globale
 */
export function isPlayerProtectedFromEvent(
  _player: PlayerState,
  unlockedAbilities: MilestoneAbility[],
  eventId: string
): boolean {
  // Verifica protezione da eventi etici
  if (eventId.includes('crisis-ethical') || eventId.includes('tech-oversight')) {
    return unlockedAbilities.some(ability => ability.effect === 'event-protection');
  }
  
  return false;
}

/**
 * Calcola il bonus punti per tecnologia bilanciata
 */
export function calculateMilestonePointsBonus(
  technology: { techPoints: number; ethicsPoints?: number },
  _player: PlayerState,
  unlockedAbilities: MilestoneAbility[]
): number {
  const balanceAbility = unlockedAbilities.find(a => a.effect === 'double-points');
  
  if (!balanceAbility) return 1;
  
  // Verifica se la tecnologia è bilanciata
  const techValue = technology.techPoints;
  const ethicsValue = technology.ethicsPoints || 0;
  if (techValue === 0 || ethicsValue === 0) return 1;
  
  const ratio = Math.min(techValue, ethicsValue) / Math.max(techValue, ethicsValue);
  if (ratio >= 0.7) { // Tecnologia bilanciata (70% o più simile)
    return 1 + (balanceAbility.value || 0);
  }
  
  return 1;
}

