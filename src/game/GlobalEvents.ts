import { GameState } from './types';
import { Scoring } from './Scoring';
import { isPlayerProtectedFromEvent } from './Milestones';
import { milestones } from './Milestones';

/**
 * Modulo centralizzato per gli eventi globali
 * Aggiunge tensione e varietà al gioco
 */

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  triggerCondition: (gameState: GameState) => boolean;
  effect: (gameState: GameState) => GameState;
}

/**
 * Eventi globali disponibili nel gioco
 */
export const globalEvents: GlobalEvent[] = [
  {
    id: 'crisis-ethical',
    title: 'Crisi Etica Pubblica',
    description: 'Uno scandalo etico coinvolge l\'IA sviluppata. I cittadini perdono fiducia nel progetto.',
    triggerCondition: (gameState) => {
      // Trigger quando un giocatore ha alta tecnologia ma bassa etica
      return gameState.players.some(p => 
        p.techPoints > 40 && p.ethicsPoints < 20 && p.neuralformingPoints > 30
      );
    },
    effect: (gameState) => {
      // Tutti i giocatori con bassa etica perdono punti (tranne quelli protetti)
      const updatedPlayers = gameState.players.map(player => {
        const playerAbilities = milestones
          .filter(m => player.unlockedMilestones.includes(m.id))
          .map(m => m.ability);
        
        // Verifica se è protetto dall'evento
        if (isPlayerProtectedFromEvent(player, playerAbilities, 'crisis-ethical')) {
          return player; // Non viene colpito
        }
        
        if (player.ethicsPoints < 25) {
          return Scoring.addPoints(player, {
            ethicsPoints: -3,
            neuralformingPoints: -2,
          });
        }
        return player;
      });
      return { ...gameState, players: updatedPlayers };
    },
  },
  {
    id: 'breakthrough-tech',
    title: 'Svolta Tecnologica',
    description: 'Una scoperta scientifica rivoluzionaria accelera lo sviluppo dell\'IA per tutti i partiti.',
    triggerCondition: (gameState) => {
      // Trigger quando il turno è multiplo di 5
      return gameState.turn % 5 === 0 && gameState.turn > 0;
    },
    effect: (gameState) => {
      // Tutti i giocatori con tecnologie guadagnano bonus
      const updatedPlayers = gameState.players.map(player => {
        if (player.technologies.length >= 3) {
          return Scoring.addPoints(player, {
            techPoints: 2,
            neuralformingPoints: 1,
          });
        }
        return player;
      });
      return { ...gameState, players: updatedPlayers };
    },
  },
  {
    id: 'public-opinion-swing',
    title: 'Cambiamento dell\'Opinione Pubblica',
    description: 'L\'opinione pubblica si sposta verso un approccio più bilanciato. I partiti bilanciati guadagnano supporto.',
    triggerCondition: (gameState) => {
      // Trigger quando un giocatore ha un buon bilanciamento
      return gameState.players.some(p => {
        const balance = Scoring.calculateBalance(p);
        return balance >= 0.6 && p.neuralformingPoints > 40;
      });
    },
    effect: (gameState) => {
      // I giocatori bilanciati guadagnano bonus
      const updatedPlayers = gameState.players.map(player => {
        const balance = Scoring.calculateBalance(player);
        if (balance >= 0.5) {
          return Scoring.addPoints(player, {
            ethicsPoints: 2,
            neuralformingPoints: 2,
          });
        }
        return player;
      });
      return { ...gameState, players: updatedPlayers };
    },
  },
  {
    id: 'tech-oversight',
    title: 'Richiesta di Maggiore Supervisione',
    description: 'Il parlamento richiede maggiore trasparenza e supervisione etica sull\'IA.',
    triggerCondition: (gameState) => {
      // Trigger quando la tecnologia è troppo avanti rispetto all'etica
      const avgTech = gameState.players.reduce((sum, p) => sum + p.techPoints, 0) / gameState.players.length;
      const avgEthics = gameState.players.reduce((sum, p) => sum + p.ethicsPoints, 0) / gameState.players.length;
      return avgTech > avgEthics + 15;
    },
    effect: (gameState) => {
      // I giocatori con alta tecnologia ma bassa etica sono penalizzati (tranne quelli protetti)
      const updatedPlayers = gameState.players.map(player => {
        const playerAbilities = milestones
          .filter(m => player.unlockedMilestones.includes(m.id))
          .map(m => m.ability);
        
        // Verifica se è protetto dall'evento
        if (isPlayerProtectedFromEvent(player, playerAbilities, 'tech-oversight')) {
          return player; // Non viene colpito
        }
        
        if (player.techPoints > player.ethicsPoints + 20) {
          return Scoring.addPoints(player, {
            techPoints: -1,
            ethicsPoints: 1, // Bonus per chi investe in etica
          });
        }
        return player;
      });
      return { ...gameState, players: updatedPlayers };
    },
  },
];

/**
 * Verifica se un evento globale deve essere attivato
 */
export function checkGlobalEvents(gameState: GameState): {
  triggeredEvent: GlobalEvent | null;
  newGameState: GameState;
} {
  // Seleziona un evento casuale tra quelli che possono essere attivati
  const availableEvents = globalEvents.filter(event => 
    event.triggerCondition(gameState)
  );
  
  if (availableEvents.length === 0) {
    return { triggeredEvent: null, newGameState: gameState };
  }
  
  // Scegli un evento casuale tra quelli disponibili
  const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
  
  // Applica l'effetto
  const newGameState = randomEvent.effect(gameState);
  
  return { triggeredEvent: randomEvent, newGameState };
}

