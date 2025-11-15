import { GameState, Dilemma, Technology, Consequence, DilemmaOption, PlayerState, MilestoneUnlocked } from './types';
import { Scoring } from './Scoring';
import { TurnManager } from './TurnManager';
import { conductParliamentVote, calculateVotingEffects } from './ParliamentVoting';
import { checkGlobalEvents } from './GlobalEvents';
import { checkMilestones, applyMilestoneVotingBonus, calculateMilestonePointsBonus } from './Milestones';
import { milestones } from './Milestones';
import { Objectives } from './Objectives';
import { News } from './News';
import dilemmasData from '../data/dilemmas.json';
import technologiesData from '../data/technologies.json';
import consequencesData from '../data/consequences.json';

/**
 * Modulo centralizzato per la logica principale del gioco
 */
export class GameEngine {
  /**
   * Nomi per i giocatori AI
   */
  private static aiNames = [
    'Partito Progressista',
    'Alleanza Tecnologica',
    'Coalizione Etica',
    'Movimento Innovazione',
  ];

  /**
   * Inizializza un nuovo stato di gioco con 5 giocatori (1 umano + 4 AI)
   */
  static initializeGame(): GameState {
    // Mescola i mazzi
    const technologyDeck = this.shuffleArray([...technologiesData] as Technology[]);
    const dilemmaDeck = this.shuffleArray([...dilemmasData] as Dilemma[]);

    // Crea i giocatori
    const players: PlayerState[] = [];

    // Giocatore umano
    const humanHand = technologyDeck.splice(0, 2);
    players.push({
      id: 'player-human',
      name: 'Il Tuo Partito',
      isAI: false,
      techPoints: 0,
      ethicsPoints: 0,
      neuralformingPoints: 0,
      technologies: [],
      hand: humanHand,
      unlockedMilestones: [],
    });

    // 4 giocatori AI
    for (let i = 0; i < 4; i++) {
      const aiHand = technologyDeck.splice(0, 2);
      players.push({
        id: `player-ai-${i}`,
        name: this.aiNames[i],
        isAI: true,
        techPoints: 0,
        ethicsPoints: 0,
        neuralformingPoints: 0,
        technologies: [],
        hand: aiHand,
        unlockedMilestones: [],
      });
    }

    // Assegna obiettivi randomicamente ai giocatori
    const objectiveAssignments = Objectives.assignObjectives(players);
    players = players.map(player => ({
      ...player,
      objectiveId: objectiveAssignments.get(player.id),
    }));

    const initialState: GameState = {
      players,
      currentPlayerId: players[0].id, // Inizia con il giocatore umano
      currentPhase: 'development',
      currentDilemma: null,
      currentConsequence: null,
      technologyDeck,
      dilemmaDeck,
      turn: 1,
      gameWon: false,
      gameLost: false,
      winnerId: null,
      activeJoker: null,
      lastVoteResult: null,
      lastVoteMessage: null,
      currentGlobalEvent: null,
      newlyUnlockedMilestones: null,
      currentNews: null,
      lastNewsTurn: undefined,
    };

    return initialState;
  }

  /**
   * Ottiene un giocatore per ID
   */
  static getPlayer(gameState: GameState, playerId: string): PlayerState | undefined {
    return gameState.players.find(p => p.id === playerId);
  }

  /**
   * Aggiorna un giocatore nello stato
   */
  static updatePlayer(gameState: GameState, playerId: string, updates: Partial<PlayerState>): GameState {
    return {
      ...gameState,
      players: gameState.players.map(p => 
        p.id === playerId ? { ...p, ...updates } : p
      ),
    };
  }

  /**
   * Pesca una carta tecnologia dal mazzo per un giocatore
   */
  static drawTechnology(gameState: GameState, playerId: string): GameState {
    if (gameState.technologyDeck.length === 0) {
      // Rimescola il mazzo se è vuoto
      const reshuffled = this.shuffleArray([...technologiesData] as Technology[]);
      return {
        ...gameState,
        technologyDeck: reshuffled,
      };
    }

    const drawnCard = gameState.technologyDeck[0];
    const newDeck = gameState.technologyDeck.slice(1);
    const player = this.getPlayer(gameState, playerId);
    
    if (!player) return gameState;

    const newHand = [...player.hand, drawnCard];

    return this.updatePlayer({
      ...gameState,
      technologyDeck: newDeck,
    }, playerId, { hand: newHand });
  }

  /**
   * Aggiunge una tecnologia alla IA di un giocatore
   * Se è una carta tecnologia normale, pesca automaticamente un dilemma
   * Se è un jolly, lo tiene attivo per il prossimo dilemma
   * @param realVotes - Mappa dei voti reali dei giocatori (per multiplayer). Se fornita, usa questi invece della logica AI.
   */
  static addTechnology(gameState: GameState, playerId: string, technology: Technology, realVotes?: Map<string, boolean>): GameState {
    const player = this.getPlayer(gameState, playerId);
    if (!player) return gameState;

    const newHand = player.hand.filter(t => t.id !== technology.id);
    
    // Se è un jolly, non lo aggiunge alle tecnologie ma lo tiene attivo
    if (technology.type === 'joker') {
      const newState = this.updatePlayer(gameState, playerId, {
        hand: newHand,
      });
      
      // Pesca automaticamente un dilemma quando si gioca un jolly
      return this.drawDilemma({
        ...newState,
        activeJoker: technology,
      });
    }
    
    // Carta tecnologia normale: aggiungi alla IA e pesca dilemma
    const newTechnologies = [...player.technologies, technology];

    // Sistema di votazione parlamentare: gli altri partiti votano sulla proposta
    // Se realVotes è fornito (multiplayer), usa i voti reali, altrimenti usa la logica AI
    let voteResult = conductParliamentVote(gameState.players, playerId, technology, realVotes);
    
    // Applica bonus milestone alla votazione
    const playerAbilities = milestones
      .filter(m => player.unlockedMilestones.includes(m.id))
      .map(m => m.ability);
    const adjustedApprovalRate = applyMilestoneVotingBonus(
      voteResult.approvalRate,
      player,
      playerAbilities
    );
    
    // Aggiorna il risultato della votazione con il bonus milestone
    voteResult = {
      ...voteResult,
      approvalRate: adjustedApprovalRate,
    };
    
    const basePoints = {
      techPoints: technology.techPoints,
      ethicsPoints: technology.ethicsPoints || 0,
      neuralformingPoints: technology.neuralformingPoints,
    };
    
    // Applica bonus milestone per tecnologie bilanciate
    const milestoneBonus = calculateMilestonePointsBonus(technology, player, playerAbilities);
    const adjustedBasePoints = {
      techPoints: basePoints.techPoints,
      ethicsPoints: basePoints.ethicsPoints,
      neuralformingPoints: Math.floor(basePoints.neuralformingPoints * milestoneBonus),
    };
    
    // Calcola punti modificati in base alla votazione
    const votingEffects = calculateVotingEffects(voteResult, adjustedBasePoints);
    const finalPoints = {
      techPoints: votingEffects.techPoints,
      ethicsPoints: votingEffects.ethicsPoints,
      neuralformingPoints: votingEffects.neuralformingPoints,
    };

    let updatedPlayer = Scoring.addPoints(player, finalPoints);
    
    // Verifica milestone raggiunti dopo aver aggiunto punti
    const newMilestones = checkMilestones(updatedPlayer, updatedPlayer.unlockedMilestones);
    let newlyUnlocked: MilestoneUnlocked[] = [];
    if (newMilestones.length > 0) {
      // Sblocca i nuovi milestone
      newlyUnlocked = newMilestones.map(m => ({ milestoneId: m.id, playerId }));
      updatedPlayer = {
        ...updatedPlayer,
        unlockedMilestones: [
          ...updatedPlayer.unlockedMilestones,
          ...newMilestones.map(m => m.id)
        ],
      };
    }

    // Reset del risultato della votazione precedente quando si passa al dilemma
    // Lo salviamo temporaneamente qui, poi lo resettiamo dopo aver mostrato il messaggio
    const newState = this.updatePlayer({
      ...gameState,
      // Salva il risultato della votazione nello stato
      lastVoteResult: voteResult,
      lastVoteMessage: votingEffects.message,
      newlyUnlockedMilestones: newlyUnlocked.length > 0 ? newlyUnlocked : null,
    }, playerId, {
      ...updatedPlayer,
      technologies: newTechnologies,
      hand: newHand,
    });

    // Verifica se il giocatore ha raggiunto il suo obiettivo dopo aver aggiunto la tecnologia
    // Questo è importante perché aggiungere una tecnologia potrebbe completare i requisiti
    const stateAfterWinCheck = TurnManager.checkGameEnd(newState);
    
    // Se il gioco è finito, non continuare con il dilemma
    if (stateAfterWinCheck.currentPhase === 'gameOver') {
      return stateAfterWinCheck;
    }

    // Pesca automaticamente un dilemma quando si gioca una carta tecnologia
    return this.drawDilemma(stateAfterWinCheck);
  }

  /**
   * Pesca un dilemma
   */
  static drawDilemma(gameState: GameState): GameState {
    if (gameState.dilemmaDeck.length === 0) {
      // Rimescola il mazzo se è vuoto
      const reshuffled = this.shuffleArray([...dilemmasData] as Dilemma[]);
      return {
        ...gameState,
        dilemmaDeck: reshuffled,
      };
    }

    const drawnDilemma = gameState.dilemmaDeck[0];
    const newDeck = gameState.dilemmaDeck.slice(1);

    // Mantieni il risultato della votazione per mostrarlo durante il dilemma
    return TurnManager.startDilemmaPhase({
      ...gameState,
      dilemmaDeck: newDeck,
    }, drawnDilemma);
  }

  /**
   * Risolve un dilemma con una scelta per un giocatore
   * Applica gli effetti del jolly se presente
   */
  static resolveDilemma(gameState: GameState, playerId: string, option: DilemmaOption): GameState {
    if (!gameState.currentDilemma) {
      return gameState;
    }

    const player = this.getPlayer(gameState, playerId);
    if (!player) return gameState;

    // Applica i punti della scelta
    let points = {
      techPoints: option.techPoints,
      ethicsPoints: option.ethicsPoints,
      neuralformingPoints: option.neuralformingPoints,
    };

    // Applica effetti del jolly se presente
    if (gameState.activeJoker && gameState.activeJoker.jokerEffect) {
      const effect = gameState.activeJoker.jokerEffect;
      
      // Applica moltiplicatori
      if (effect.multiplier) {
        points = {
          techPoints: Math.floor(points.techPoints * (effect.multiplier.techPoints || 1)),
          ethicsPoints: Math.floor(points.ethicsPoints * (effect.multiplier.ethicsPoints || 1)),
          neuralformingPoints: Math.floor(points.neuralformingPoints * (effect.multiplier.neuralformingPoints || 1)),
        };
      }
      
      // Applica bonus
      if (effect.bonus) {
        points = {
          techPoints: points.techPoints + (effect.bonus.techPoints || 0),
          ethicsPoints: points.ethicsPoints + (effect.bonus.ethicsPoints || 0),
          neuralformingPoints: points.neuralformingPoints + (effect.bonus.neuralformingPoints || 0),
        };
      }
    }

    let updatedPlayer = Scoring.addPoints(player, points);
    
    // Verifica milestone raggiunti dopo aver aggiunto punti
    const newMilestones = checkMilestones(updatedPlayer, updatedPlayer.unlockedMilestones);
    if (newMilestones.length > 0) {
      updatedPlayer = {
        ...updatedPlayer,
        unlockedMilestones: [
          ...updatedPlayer.unlockedMilestones,
          ...newMilestones.map(m => m.id)
        ],
      };
    }

    // Trova la conseguenza
    const consequence = (consequencesData as Consequence[]).find(
      c => c.id === option.consequence
    );

    if (consequence) {
      // Applica gli effetti della conseguenza
      const consequencePoints = {
        techPoints: consequence.effect.techPoints,
        ethicsPoints: consequence.effect.ethicsPoints,
        neuralformingPoints: consequence.effect.neuralformingPoints,
      };

      let finalPlayer = Scoring.addPoints(updatedPlayer, consequencePoints);
      
      // Verifica milestone raggiunti dopo la conseguenza
      const consequenceMilestones = checkMilestones(finalPlayer, finalPlayer.unlockedMilestones);
      let consequenceNewlyUnlocked: MilestoneUnlocked[] = [];
      if (consequenceMilestones.length > 0) {
        consequenceNewlyUnlocked = consequenceMilestones.map(m => ({ milestoneId: m.id, playerId }));
        finalPlayer = {
          ...finalPlayer,
          unlockedMilestones: [
            ...finalPlayer.unlockedMilestones,
            ...consequenceMilestones.map(m => m.id)
          ],
        };
      }

      const newState = this.updatePlayer({
        ...gameState,
        newlyUnlockedMilestones: consequenceNewlyUnlocked.length > 0 ? consequenceNewlyUnlocked : null,
      }, playerId, finalPlayer);

      // Avvia la fase di conseguenze e resetta il jolly e il risultato della votazione
      const stateWithConsequence = TurnManager.startConsequencePhase({
        ...newState,
        currentDilemma: null,
        activeJoker: null,
        lastVoteResult: null,
        lastVoteMessage: null,
      }, consequence);
      
      // Verifica condizioni di fine gioco
      return TurnManager.checkGameEnd(stateWithConsequence);
    }

    // Resetta il jolly e il risultato della votazione dopo aver risolto il dilemma
    // E passa al prossimo giocatore
    const stateAfterDilemma = this.updatePlayer({
      ...gameState,
      activeJoker: null,
      lastVoteResult: null,
      lastVoteMessage: null,
    }, playerId, updatedPlayer);
    
    // Verifica condizioni di fine gioco prima di passare al prossimo giocatore
    const stateAfterCheck = TurnManager.checkGameEnd(stateAfterDilemma);
    
    // Se il gioco non è finito, passa al prossimo giocatore
    if (stateAfterCheck.currentPhase !== 'gameOver') {
      return TurnManager.nextPlayer(stateAfterCheck);
    }
    
    return stateAfterCheck;
  }

  /**
   * Completa la fase di conseguenze e avanza al turno successivo
   * Verifica anche se devono essere attivati eventi globali e news
   */
  static completeConsequencePhase(gameState: GameState): GameState {
    const stateAfterConsequence = {
      ...gameState,
      currentConsequence: null,
    };
    
    // Verifica eventi globali prima di passare al prossimo giocatore
    const { triggeredEvent, newGameState } = checkGlobalEvents(stateAfterConsequence);
    
    let finalState = TurnManager.nextPlayer(newGameState);
    
    // Processa le news se necessario (dopo il cambio turno)
    finalState = News.processNews(finalState);
    
    // Se un evento è stato attivato, salvalo nello stato
    if (triggeredEvent) {
      finalState = {
        ...finalState,
        currentGlobalEvent: {
          id: triggeredEvent.id,
          title: triggeredEvent.title,
          description: triggeredEvent.description,
        },
      };
    } else {
      finalState = {
        ...finalState,
        currentGlobalEvent: null,
      };
    }
    
    return finalState;
  }

  /**
   * Mescola un array (algoritmo Fisher-Yates)
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
