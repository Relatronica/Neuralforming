import { PlayerState, PlayerObjective } from './types';
import { Scoring } from './Scoring';
import objectivesData from '../data/objectives.json';

/**
 * Modulo centralizzato per la gestione degli obiettivi del giocatore
 */
export class Objectives {
  private static objectives: PlayerObjective[] = objectivesData as PlayerObjective[];

  /**
   * Ottiene tutti gli obiettivi disponibili
   */
  static getAllObjectives(): PlayerObjective[] {
    return [...this.objectives];
  }

  /**
   * Ottiene un obiettivo per ID
   */
  static getObjectiveById(id: string): PlayerObjective | undefined {
    return this.objectives.find(obj => obj.id === id);
  }

  /**
   * Assegna obiettivi randomicamente ai giocatori
   * Cerca di bilanciare la difficoltà tra i giocatori
   */
  static assignObjectives(players: PlayerState[]): Map<string, string> {
    const assignments = new Map<string, string>();
    const availableObjectives = [...this.objectives];
    const usedObjectives = new Set<string>();

    // Mescola i giocatori per assegnazione random
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Assegna obiettivi bilanciando la difficoltà
    shuffledPlayers.forEach((player, index) => {
      // Filtra obiettivi non ancora assegnati
      const available = availableObjectives.filter(obj => !usedObjectives.has(obj.id));
      
      if (available.length === 0) {
        // Se non ci sono più obiettivi disponibili, riusa quelli già usati
        const randomObjective = availableObjectives[Math.floor(Math.random() * availableObjectives.length)];
        assignments.set(player.id, randomObjective.id);
      } else {
        // Scegli un obiettivo random tra quelli disponibili
        const randomIndex = Math.floor(Math.random() * available.length);
        const selectedObjective = available[randomIndex];
        assignments.set(player.id, selectedObjective.id);
        usedObjectives.add(selectedObjective.id);
      }
    });

    return assignments;
  }

  /**
   * Verifica se un giocatore ha raggiunto il suo obiettivo
   */
  static checkObjectiveCompletion(player: PlayerState, objectiveId: string): boolean {
    const objective = this.getObjectiveById(objectiveId);
    if (!objective) return false;

    const requirements = objective.requirements;
    
    // Controlla tutti i requisiti
    if (requirements.techPoints !== undefined && player.techPoints < requirements.techPoints) {
      return false;
    }
    if (requirements.ethicsPoints !== undefined && player.ethicsPoints < requirements.ethicsPoints) {
      return false;
    }
    if (requirements.neuralformingPoints !== undefined && player.neuralformingPoints < requirements.neuralformingPoints) {
      return false;
    }
    if (requirements.technologiesCount !== undefined && player.technologies.length < requirements.technologiesCount) {
      return false;
    }
    if (requirements.balance !== undefined) {
      const balance = Scoring.calculateBalance(player);
      if (balance < requirements.balance) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calcola il progresso verso l'obiettivo (0-100%)
   */
  static calculateObjectiveProgress(player: PlayerState, objectiveId: string): number {
    const objective = this.getObjectiveById(objectiveId);
    if (!objective) return 0;

    const requirements = objective.requirements;
    const progresses: number[] = [];

    // Calcola progresso per ogni requisito
    if (requirements.techPoints !== undefined) {
      const progress = Math.min(100, (player.techPoints / requirements.techPoints) * 100);
      progresses.push(progress);
    }
    if (requirements.ethicsPoints !== undefined) {
      const progress = Math.min(100, (player.ethicsPoints / requirements.ethicsPoints) * 100);
      progresses.push(progress);
    }
    if (requirements.neuralformingPoints !== undefined) {
      const progress = Math.min(100, (player.neuralformingPoints / requirements.neuralformingPoints) * 100);
      progresses.push(progress);
    }
    if (requirements.technologiesCount !== undefined) {
      const progress = Math.min(100, (player.technologies.length / requirements.technologiesCount) * 100);
      progresses.push(progress);
    }
    if (requirements.balance !== undefined) {
      const balance = Scoring.calculateBalance(player);
      const progress = Math.min(100, (balance / requirements.balance) * 100);
      progresses.push(progress);
    }

    // Media dei progressi (tutti i requisiti devono essere soddisfatti)
    if (progresses.length === 0) return 0;
    return Math.round(progresses.reduce((sum, p) => sum + p, 0) / progresses.length);
  }

  /**
   * Ottiene un riepilogo dettagliato del progresso verso l'obiettivo
   */
  static getObjectiveProgressDetails(player: PlayerState, objectiveId: string): {
    completed: boolean;
    overallProgress: number;
    details: Array<{ requirement: string; current: number; target: number; progress: number }>;
  } {
    const objective = this.getObjectiveById(objectiveId);
    if (!objective) {
      return {
        completed: false,
        overallProgress: 0,
        details: [],
      };
    }

    const requirements = objective.requirements;
    const details: Array<{ requirement: string; current: number; target: number; progress: number }> = [];

    if (requirements.techPoints !== undefined) {
      const progress = Math.min(100, (player.techPoints / requirements.techPoints) * 100);
      details.push({
        requirement: 'Tech Points',
        current: player.techPoints,
        target: requirements.techPoints,
        progress: Math.round(progress),
      });
    }
    if (requirements.ethicsPoints !== undefined) {
      const progress = Math.min(100, (player.ethicsPoints / requirements.ethicsPoints) * 100);
      details.push({
        requirement: 'Ethics Points',
        current: player.ethicsPoints,
        target: requirements.ethicsPoints,
        progress: Math.round(progress),
      });
    }
    if (requirements.neuralformingPoints !== undefined) {
      const progress = Math.min(100, (player.neuralformingPoints / requirements.neuralformingPoints) * 100);
      details.push({
        requirement: 'Neuralforming Points',
        current: player.neuralformingPoints,
        target: requirements.neuralformingPoints,
        progress: Math.round(progress),
      });
    }
    if (requirements.technologiesCount !== undefined) {
      const progress = Math.min(100, (player.technologies.length / requirements.technologiesCount) * 100);
      details.push({
        requirement: 'Technologies',
        current: player.technologies.length,
        target: requirements.technologiesCount,
        progress: Math.round(progress),
      });
    }
    if (requirements.balance !== undefined) {
      const balance = Scoring.calculateBalance(player);
      const balancePercent = Math.round(balance * 100);
      const targetPercent = Math.round(requirements.balance * 100);
      const progress = Math.min(100, (balance / requirements.balance) * 100);
      details.push({
        requirement: 'Balance',
        current: balancePercent,
        target: targetPercent,
        progress: Math.round(progress),
      });
    }

    const completed = this.checkObjectiveCompletion(player, objectiveId);
    const overallProgress = this.calculateObjectiveProgress(player, objectiveId);

    return {
      completed,
      overallProgress,
      details,
    };
  }
}

