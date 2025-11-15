import { PlayerState, Technology, VoteResult } from './types';
import { Scoring } from './Scoring';

/**
 * Modulo centralizzato per il sistema di votazione parlamentare
 * Aggiunge interazione strategica tra i partiti
 */

/**
 * Calcola quanto un partito è allineato con una tecnologia proposta
 * basandosi sulla sua strategia e sui punti che riceverebbe
 */
function calculateAlignment(player: PlayerState, technology: Technology): number {
  const balance = Scoring.calculateBalance(player);
  const playerTotalTech = player.techPoints;
  const playerTotalEthics = player.ethicsPoints;
  
  // Calcola quanto la tecnologia allinea con la strategia del partito
  let alignment = 0;
  
  // Se il partito è sbilanciato verso tech, preferisce tecnologie tech
  if (balance < 0.4 && playerTotalTech > playerTotalEthics) {
    alignment = technology.techPoints * 2;
    if (technology.ethicsPoints) {
      alignment -= technology.ethicsPoints; // Penalizza tecnologie troppo etiche
    }
  }
  // Se è sbilanciato verso ethics, preferisce tecnologie etiche
  else if (balance < 0.4 && playerTotalEthics > playerTotalTech) {
    alignment = (technology.ethicsPoints || 0) * 2;
    alignment -= technology.techPoints * 0.5; // Penalizza tecnologie troppo tech
  }
  // Se è bilanciato, preferisce tecnologie bilanciate
  else {
    const techValue = technology.techPoints;
    const ethicsValue = technology.ethicsPoints || 0;
    const balanceRatio = Math.min(techValue, ethicsValue) / Math.max(techValue, ethicsValue || 1);
    alignment = (techValue + ethicsValue) * (0.5 + balanceRatio * 0.5);
  }
  
  // Bonus per Neuralforming (tutti lo vogliono)
  alignment += technology.neuralformingPoints * 1.5;
  
  // Penalità se il partito è già molto avanti e la tecnologia è debole
  if (player.neuralformingPoints > 70 && technology.neuralformingPoints < 3) {
    alignment *= 0.5;
  }
  
  return alignment;
}

/**
 * Determina come un partito voterebbe su una proposta
 * Ritorna true se vota a favore, false se contro
 */
function howWouldPlayerVote(player: PlayerState, technology: Technology, proposer: PlayerState): boolean {
  // Un partito non vota contro sé stesso
  if (player.id === proposer.id) {
    return true;
  }
  
  const alignment = calculateAlignment(player, technology);
  
  // Soglia di approvazione basata su allineamento
  // Valori più alti = più facile approvare
  let threshold = 15;
  
  // Se il partito è vicino alla vittoria, è più selettivo
  if (player.neuralformingPoints > 50) {
    threshold += 10;
  }
  
  // Se il proponente è in vantaggio, gli altri sono più cauti
  if (proposer.neuralformingPoints > player.neuralformingPoints + 20) {
    threshold += 5;
  }
  
  // Aggiungi un po' di randomness per varietà (10% variabilità)
  const randomFactor = (Math.random() - 0.5) * threshold * 0.2;
  const finalAlignment = alignment + randomFactor;
  
  return finalAlignment >= threshold;
}

/**
 * Simula una votazione parlamentare su una tecnologia proposta
 * Se realVotes è fornito, usa i voti reali dei giocatori invece di calcolarli
 */
export function conductParliamentVote(
  allPlayers: PlayerState[],
  proposerId: string,
  technology: Technology,
  realVotes?: Map<string, boolean>
): VoteResult {
  const proposer = allPlayers.find(p => p.id === proposerId);
  if (!proposer) {
    throw new Error(`Proposer ${proposerId} not found`);
  }
  
  // Se ci sono voti reali, usali (multiplayer)
  if (realVotes) {
    const supporters: string[] = [proposerId]; // Il proponente vota sempre a favore
    const opponents: string[] = [];
    
    realVotes.forEach((vote, playerId) => {
      if (playerId !== proposerId) {
        if (vote) {
          supporters.push(playerId);
        } else {
          opponents.push(playerId);
        }
      }
    });
    
    const votesFor = supporters.length;
    const votesAgainst = opponents.length;
    const totalVotes = allPlayers.filter(p => !p.isAI).length; // Solo giocatori umani votano
    const approvalRate = totalVotes > 0 ? votesFor / totalVotes : 1;
    
    return {
      votesFor,
      votesAgainst,
      approvalRate,
      supporters,
      opponents,
    };
  }
  
  // Altrimenti usa la logica AI (single-player)
  const voters = allPlayers.filter(p => p.id !== proposerId);
  const supporters: string[] = [];
  const opponents: string[] = [];
  
  voters.forEach(voter => {
    const vote = howWouldPlayerVote(voter, technology, proposer);
    if (vote) {
      supporters.push(voter.id);
    } else {
      opponents.push(voter.id);
    }
  });
  
  const votesFor = supporters.length + 1; // +1 per il proponente
  const votesAgainst = opponents.length;
  const totalVotes = allPlayers.length;
  const approvalRate = votesFor / totalVotes;
  
  return {
    votesFor,
    votesAgainst,
    approvalRate,
    supporters: [proposerId, ...supporters],
    opponents,
  };
}

/**
 * Calcola i bonus/penalità basati sul risultato della votazione
 */
export function calculateVotingEffects(
  voteResult: VoteResult,
  basePoints: {
    techPoints: number;
    ethicsPoints: number;
    neuralformingPoints: number;
  }
): {
  techPoints: number;
  ethicsPoints: number;
  neuralformingPoints: number;
  message: string;
} {
  const { approvalRate } = voteResult;
  
  // Bonus per alta approvazione (>70%)
  if (approvalRate >= 0.7) {
    return {
      techPoints: Math.floor(basePoints.techPoints * 1.3),
      ethicsPoints: Math.floor(basePoints.ethicsPoints * 1.3),
      neuralformingPoints: Math.floor(basePoints.neuralformingPoints * 1.2),
      message: `Approvazione schiacciante! La proposta ha ricevuto ampio sostegno parlamentare (+30% bonus)`,
    };
  }
  
  // Bonus per buona approvazione (>50%)
  if (approvalRate >= 0.5) {
    return {
      techPoints: Math.floor(basePoints.techPoints * 1.1),
      ethicsPoints: Math.floor(basePoints.ethicsPoints * 1.1),
      neuralformingPoints: Math.floor(basePoints.neuralformingPoints * 1.1),
      message: `Approvata! La proposta ha ottenuto il sostegno della maggioranza (+10% bonus)`,
    };
  }
  
  // Penalità per bassa approvazione (<50%)
  if (approvalRate >= 0.3) {
    return {
      techPoints: Math.floor(basePoints.techPoints * 0.7),
      ethicsPoints: Math.floor(basePoints.ethicsPoints * 0.7),
      neuralformingPoints: Math.floor(basePoints.neuralformingPoints * 0.8),
      message: `Approvata di stretta misura. L'opposizione ha limitato l'efficacia della proposta (-30% penalità)`,
    };
  }
  
  // Forte penalità per approvazione molto bassa (<30%)
  return {
    techPoints: Math.floor(basePoints.techPoints * 0.4),
    ethicsPoints: Math.floor(basePoints.ethicsPoints * 0.4),
    neuralformingPoints: Math.floor(basePoints.neuralformingPoints * 0.6),
    message: `Approvata con grande difficoltà. La forte opposizione ha compromesso seriamente l'implementazione (-60% penalità)`,
  };
}

