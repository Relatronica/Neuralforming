import { 
  Technology, 
  Dilemma, 
  DilemmaOption, 
  Consequence, 
  PlayerState, 
  MilestoneUnlocked, 
  SocietyNews,
  GlobalEventInfo,
} from './types';
import { 
  SinglePlayerState, 
  DecisionHistoryEntry,
} from './singlePlayerTypes';
import { Scoring } from './Scoring';
import { PublicOpinion } from './PublicOpinion';
import { DifficultyManager } from './DifficultyManager';
import { Objectives } from './Objectives';
import { checkMilestones, calculateMilestonePointsBonus, milestones } from './Milestones';
import { checkGlobalEvents } from './GlobalEvents';
import technologiesData from '../data/technologies.json';
import dilemmasData from '../data/dilemmas.json';
import consequencesData from '../data/consequences.json';

/**
 * Engine dedicato al Single Player.
 * 
 * Game loop:
 *   1. DEVELOPMENT  → Il giocatore sceglie una tecnologia dalla mano
 *   2. OPINION      → L'opinione pubblica reagisce alla scelta
 *   3. DILEMMA      → Il giocatore affronta un dilemma etico
 *   4. CONSEQUENCE  → Visualizzazione conseguenza + effetto su opinione
 *   5. END TURN     → Check eventi/news, incrementa turno, aggiorna difficoltà
 *   6. Ripeti fino a gameOver
 * 
 * Differenze dal multiplayer:
 *   - Un solo giocatore, nessun AI
 *   - Opinione pubblica al posto del voting parlamentare
 *   - Difficoltà progressiva
 *   - Nessun tempo morto
 */
export class SinglePlayerEngine {

  // ============================================================
  // Inizializzazione
  // ============================================================

  /**
   * Inizializza una nuova partita single player.
   * Un solo giocatore, 3 carte iniziali, opinione pubblica a 50.
   */
  static initializeGame(objectiveId?: string): SinglePlayerState {
    const technologyDeck = this.shuffleArray([...technologiesData] as Technology[]);
    const dilemmaDeck = this.shuffleArray([...dilemmasData] as Dilemma[]);

    // Pesca 3 carte iniziali per il giocatore
    const initialHand = technologyDeck.splice(0, 3);

    // Crea il giocatore
    const player: PlayerState = {
      id: 'player-human',
      name: 'Il Tuo Partito',
      isAI: false,
      techPoints: 0,
      ethicsPoints: 0,
      neuralformingPoints: 0,
      technologies: [],
      hand: initialHand,
      unlockedMilestones: [],
    };

    // Assegna un obiettivo
    let assignedObjectiveId = objectiveId;
    if (!assignedObjectiveId) {
      const allObjectives = Objectives.getAllObjectives();
      const randomObjective = allObjectives[Math.floor(Math.random() * allObjectives.length)];
      assignedObjectiveId = randomObjective.id;
    }
    
    const playerWithObjective: PlayerState = {
      ...player,
      objectiveId: assignedObjectiveId,
    };

    return {
      player: playerWithObjective,
      currentPhase: 'development',
      turn: 1,
      technologyDeck,
      dilemmaDeck,
      currentDilemma: null,
      currentConsequence: null,
      activeJoker: null,
      resolvedDilemmaOption: null,
      publicOpinion: PublicOpinion.createInitialState(),
      lastOpinionReaction: null,
      difficulty: 'easy',
      currentGlobalEvent: null,
      currentNews: null,
      lastNewsTurn: undefined,
      newlyUnlockedMilestones: null,
      gameWon: false,
      gameLost: false,
      gameOverReason: null,
      decisionHistory: [],
    };
  }

  // ============================================================
  // Fase DEVELOPMENT: pesca e scelta tecnologia
  // ============================================================

  /**
   * Pesca carte tecnologia per il giocatore.
   * Il numero di carte dipende dalla difficoltà.
   */
  static drawCards(state: SinglePlayerState): SinglePlayerState {
    const count = DifficultyManager.getCardsToDrawCount(state.difficulty);
    let { technologyDeck, player } = state;
    const newCards: Technology[] = [];

    for (let i = 0; i < count; i++) {
      if (technologyDeck.length === 0) {
        // Rimescola se il mazzo è vuoto
        technologyDeck = this.shuffleArray([...technologiesData] as Technology[]);
      }
      newCards.push(technologyDeck[0]);
      technologyDeck = technologyDeck.slice(1);
    }

    return {
      ...state,
      technologyDeck,
      player: {
        ...player,
        hand: [...player.hand, ...newCards],
      },
    };
  }

  // ============================================================
  // Fase TECHNOLOGY: proponi tecnologia + reazione opinione
  // ============================================================

  /**
   * Il giocatore propone una tecnologia.
   * L'opinione pubblica reagisce e modifica i punti.
   * Restituisce lo stato con la fase opinion_reaction.
   */
  static proposeTechnology(
    state: SinglePlayerState, 
    technology: Technology,
  ): SinglePlayerState {
    const { player, publicOpinion } = state;

    // Rimuovi la carta dalla mano
    const newHand = player.hand.filter(t => t.id !== technology.id);

    // Se è un joker, attivalo e pesca un dilemma
    if (technology.type === 'joker') {
      const newState: SinglePlayerState = {
        ...state,
        player: { ...player, hand: newHand },
        activeJoker: technology,
        lastOpinionReaction: null,
      };
      return this.presentDilemma(newState);
    }

    // Reazione dell'opinione pubblica
    const { newOpinion, reaction } = PublicOpinion.reactToTechnology(
      publicOpinion, 
      technology,
    );

    // Se respinta (opinione troppo bassa), la tecnologia non viene aggiunta
    if (reaction.isRejected) {
      // Penalità per il rifiuto
      const penaltyPoints = {
        techPoints: -Math.floor(technology.techPoints * 0.3),
        ethicsPoints: -Math.floor((technology.ethicsPoints || 0) * 0.3),
        neuralformingPoints: -Math.floor(technology.neuralformingPoints * 0.3),
      };
      
      const updatedPlayer = Scoring.addPoints(player, penaltyPoints);

      // Aggiungi alla storia
      const historyEntry: DecisionHistoryEntry = {
        turn: state.turn,
        type: 'technology',
        title: `${technology.name} (RESPINTA)`,
        opinionChange: reaction.change,
        pointsGained: penaltyPoints,
      };

      return {
        ...state,
        player: { ...updatedPlayer, hand: newHand },
        publicOpinion: newOpinion,
        lastOpinionReaction: reaction,
        currentPhase: 'opinion_reaction',
        decisionHistory: [...state.decisionHistory, historyEntry],
      };
    }

    // Tecnologia approvata: calcola punti con moltiplicatore opinione
    const basePoints = {
      techPoints: technology.techPoints,
      ethicsPoints: technology.ethicsPoints || 0,
      neuralformingPoints: technology.neuralformingPoints,
    };

    // Applica bonus milestone per tecnologie bilanciate
    const playerAbilities = milestones
      .filter(m => player.unlockedMilestones.includes(m.id))
      .map(m => m.ability);
    const milestoneBonus = calculateMilestonePointsBonus(technology, player, playerAbilities);

    // Applica il moltiplicatore dell'opinione pubblica
    const multiplier = reaction.effectivenessMultiplier;
    
    const finalPoints = {
      techPoints: Math.floor(basePoints.techPoints * multiplier),
      ethicsPoints: Math.floor(basePoints.ethicsPoints * multiplier),
      neuralformingPoints: Math.floor(basePoints.neuralformingPoints * multiplier * milestoneBonus),
    };

    let updatedPlayer = Scoring.addPoints(player, finalPoints);
    updatedPlayer = {
      ...updatedPlayer,
      technologies: [...updatedPlayer.technologies, technology],
      hand: newHand,
    };

    // Check milestones
    const newMilestones = checkMilestones(updatedPlayer, updatedPlayer.unlockedMilestones);
    let newlyUnlocked: MilestoneUnlocked[] = [];
    if (newMilestones.length > 0) {
      newlyUnlocked = newMilestones.map(m => ({ milestoneId: m.id, playerId: player.id }));
      updatedPlayer = {
        ...updatedPlayer,
        unlockedMilestones: [
          ...updatedPlayer.unlockedMilestones,
          ...newMilestones.map(m => m.id),
        ],
      };
    }

    // Aggiungi alla storia
    const historyEntry: DecisionHistoryEntry = {
      turn: state.turn,
      type: 'technology',
      title: technology.name,
      opinionChange: reaction.change,
      pointsGained: finalPoints,
    };

    // Check game over dopo la tecnologia
    const gameEnd = this.checkGameEnd({
      ...state,
      player: updatedPlayer,
    });

    if (gameEnd.gameWon || gameEnd.gameLost) {
      return {
        ...state,
        player: updatedPlayer,
        publicOpinion: newOpinion,
        lastOpinionReaction: reaction,
        currentPhase: 'gameOver',
        newlyUnlockedMilestones: newlyUnlocked.length > 0 ? newlyUnlocked : null,
        decisionHistory: [...state.decisionHistory, historyEntry],
        gameWon: gameEnd.gameWon,
        gameLost: gameEnd.gameLost,
        gameOverReason: gameEnd.reason,
      };
    }

    return {
      ...state,
      player: updatedPlayer,
      publicOpinion: newOpinion,
      lastOpinionReaction: reaction,
      currentPhase: 'opinion_reaction',
      newlyUnlockedMilestones: newlyUnlocked.length > 0 ? newlyUnlocked : null,
      decisionHistory: [...state.decisionHistory, historyEntry],
    };
  }

  // ============================================================
  // Fase DILEMMA: pesca e risolvi
  // ============================================================

  /**
   * Pesca un dilemma appropriato alla difficoltà corrente.
   * Avanza automaticamente alla fase 'dilemma'.
   */
  static presentDilemma(state: SinglePlayerState): SinglePlayerState {
    let { dilemmaDeck, difficulty } = state;

    if (dilemmaDeck.length === 0) {
      dilemmaDeck = this.shuffleArray([...dilemmasData] as Dilemma[]);
    }

    // Filtra per difficoltà
    const filteredDilemmas = DifficultyManager.filterDilemmasByDifficulty(dilemmaDeck, difficulty);
    
    // Scegli il primo dilemma dal pool filtrato (che è già random dal mescolo iniziale)
    const selectedDilemma = filteredDilemmas.length > 0 ? filteredDilemmas[0] : dilemmaDeck[0];
    
    // Rimuovi il dilemma dal mazzo
    const newDeck = dilemmaDeck.filter(d => d.id !== selectedDilemma.id);

    return {
      ...state,
      dilemmaDeck: newDeck,
      currentDilemma: selectedDilemma,
      currentPhase: 'dilemma',
      resolvedDilemmaOption: null,
    };
  }

  /**
   * Risolve un dilemma con la scelta del giocatore.
   * Applica effetti del joker se presente.
   * Avanza alla fase consequence.
   */
  static resolveDilemma(
    state: SinglePlayerState, 
    option: DilemmaOption,
  ): SinglePlayerState {
    if (!state.currentDilemma) return state;

    const { player, publicOpinion, activeJoker } = state;

    // Calcola i punti della scelta
    let points = {
      techPoints: option.techPoints,
      ethicsPoints: option.ethicsPoints,
      neuralformingPoints: option.neuralformingPoints,
    };

    // Applica effetti del joker se presente
    if (activeJoker?.jokerEffect) {
      const effect = activeJoker.jokerEffect;
      if (effect.multiplier) {
        points = {
          techPoints: Math.floor(points.techPoints * (effect.multiplier.techPoints || 1)),
          ethicsPoints: Math.floor(points.ethicsPoints * (effect.multiplier.ethicsPoints || 1)),
          neuralformingPoints: Math.floor(points.neuralformingPoints * (effect.multiplier.neuralformingPoints || 1)),
        };
      }
      if (effect.bonus) {
        points = {
          techPoints: points.techPoints + (effect.bonus.techPoints || 0),
          ethicsPoints: points.ethicsPoints + (effect.bonus.ethicsPoints || 0),
          neuralformingPoints: points.neuralformingPoints + (effect.bonus.neuralformingPoints || 0),
        };
      }
    }

    // Applica moltiplicatore opinione anche ai punti del dilemma
    const opinionMultiplier = PublicOpinion.getEffectivenessMultiplier(publicOpinion.value);
    points = {
      techPoints: Math.floor(points.techPoints * opinionMultiplier),
      ethicsPoints: Math.floor(points.ethicsPoints * opinionMultiplier),
      neuralformingPoints: Math.floor(points.neuralformingPoints * opinionMultiplier),
    };

    let updatedPlayer = Scoring.addPoints(player, points);

    // Effetto del dilemma sull'opinione pubblica
    const newOpinion = PublicOpinion.applyDilemmaEffect(publicOpinion, option);

    // Check milestones
    const newMilestones = checkMilestones(updatedPlayer, updatedPlayer.unlockedMilestones);
    let newlyUnlocked: MilestoneUnlocked[] = [];
    if (newMilestones.length > 0) {
      newlyUnlocked = newMilestones.map(m => ({ milestoneId: m.id, playerId: player.id }));
      updatedPlayer = {
        ...updatedPlayer,
        unlockedMilestones: [
          ...updatedPlayer.unlockedMilestones,
          ...newMilestones.map(m => m.id),
        ],
      };
    }

    // Trova la conseguenza collegata
    const consequence = (consequencesData as Consequence[]).find(
      c => c.id === option.consequence
    );

    if (consequence) {
      // Applica punti della conseguenza con moltiplicatore difficoltà
      const consequenceMultiplier = DifficultyManager.getConsequenceMultiplier(state.difficulty);
      const consequencePoints = {
        techPoints: Math.floor((consequence.effect.techPoints || 0) * consequenceMultiplier),
        ethicsPoints: Math.floor((consequence.effect.ethicsPoints || 0) * consequenceMultiplier),
        neuralformingPoints: Math.floor((consequence.effect.neuralformingPoints || 0) * consequenceMultiplier),
      };

      updatedPlayer = Scoring.addPoints(updatedPlayer, consequencePoints);

      // Check milestones dopo conseguenza
      const consequenceMilestones = checkMilestones(updatedPlayer, updatedPlayer.unlockedMilestones);
      if (consequenceMilestones.length > 0) {
        const moreMilestones = consequenceMilestones.map(m => ({ milestoneId: m.id, playerId: player.id }));
        newlyUnlocked = [...newlyUnlocked, ...moreMilestones];
        updatedPlayer = {
          ...updatedPlayer,
          unlockedMilestones: [
            ...updatedPlayer.unlockedMilestones,
            ...consequenceMilestones.map(m => m.id),
          ],
        };
      }

      // Conseguenza influenza anche l'opinione
      const opinionAfterConsequence = PublicOpinion.applyConsequenceEffect(newOpinion, consequence);

      // Aggiungi alla storia
      const historyEntry: DecisionHistoryEntry = {
        turn: state.turn,
        type: 'dilemma',
        title: option.text.substring(0, 60) + (option.text.length > 60 ? '...' : ''),
        opinionChange: opinionAfterConsequence.value - publicOpinion.value,
        pointsGained: points,
      };

      return {
        ...state,
        player: updatedPlayer,
        publicOpinion: opinionAfterConsequence,
        currentPhase: 'consequence',
        currentConsequence: consequence,
        resolvedDilemmaOption: option,
        activeJoker: null,
        newlyUnlockedMilestones: newlyUnlocked.length > 0 ? newlyUnlocked : null,
        decisionHistory: [...state.decisionHistory, historyEntry],
      };
    }

    // Nessuna conseguenza trovata: avanza direttamente
    const historyEntry: DecisionHistoryEntry = {
      turn: state.turn,
      type: 'dilemma',
      title: option.text.substring(0, 60) + (option.text.length > 60 ? '...' : ''),
      opinionChange: newOpinion.value - publicOpinion.value,
      pointsGained: points,
    };

    return {
      ...state,
      player: updatedPlayer,
      publicOpinion: newOpinion,
      currentPhase: 'consequence',
      currentConsequence: null,
      resolvedDilemmaOption: option,
      activeJoker: null,
      newlyUnlockedMilestones: newlyUnlocked.length > 0 ? newlyUnlocked : null,
      decisionHistory: [...state.decisionHistory, historyEntry],
    };
  }

  // ============================================================
  // Fase CONSEQUENCE: completa e avanza
  // ============================================================

  /**
   * Completa la fase consequence e prepara il prossimo turno.
   * Controlla eventi, news, e condizioni di fine partita.
   */
  static completeConsequencePhase(state: SinglePlayerState): SinglePlayerState {
    let newState: SinglePlayerState = {
      ...state,
      currentConsequence: null,
      currentDilemma: null,
      resolvedDilemmaOption: null,
      lastOpinionReaction: null,
    };

    // Tick dei modificatori di opinione pubblica
    const tickedOpinion = PublicOpinion.tickModifiers(newState.publicOpinion);
    newState = { ...newState, publicOpinion: tickedOpinion };

    // Check game over
    const gameEnd = this.checkGameEnd(newState);
    if (gameEnd.gameWon || gameEnd.gameLost) {
      return {
        ...newState,
        currentPhase: 'gameOver',
        gameWon: gameEnd.gameWon,
        gameLost: gameEnd.gameLost,
        gameOverReason: gameEnd.reason,
      };
    }

    // Check eventi globali
    let globalEvent: GlobalEventInfo | null = null;
    if (DifficultyManager.shouldTriggerGlobalEvent(newState)) {
      // Adatta lo stato per il sistema di eventi globali (che usa GameState)
      const adaptedState = this.adaptToGameState(newState);
      const { triggeredEvent, newGameState } = checkGlobalEvents(adaptedState);
      
      if (triggeredEvent) {
        // Recupera il giocatore aggiornato
        const updatedPlayer = newGameState.players.find(p => p.id === newState.player.id);
        if (updatedPlayer) {
          newState = { ...newState, player: updatedPlayer };
        }
        globalEvent = {
          id: triggeredEvent.id,
          title: triggeredEvent.title,
          description: triggeredEvent.description,
        };
      }
    }

    // Check news
    let newsItem: SocietyNews | null = null;
    if (DifficultyManager.shouldShowNews(newState)) {
      newsItem = DifficultyManager.selectAppropriateNews(newState);
      if (newsItem) {
        // Applica l'effetto della news al giocatore
        const newsEffect = newsItem.effect;
        const updatedPlayer: PlayerState = {
          ...newState.player,
          techPoints: Math.max(0, newState.player.techPoints + (newsEffect.techPoints || 0)),
          ethicsPoints: Math.max(0, newState.player.ethicsPoints + (newsEffect.ethicsPoints || 0)),
          neuralformingPoints: Math.max(0, newState.player.neuralformingPoints + (newsEffect.neuralformingPoints || 0)),
        };
        newState = { ...newState, player: updatedPlayer, lastNewsTurn: newState.turn };
      }
    }

    // Incrementa il turno
    const newTurn = newState.turn + 1;
    
    // Aggiorna la difficoltà
    const stateForDifficulty = { ...newState, turn: newTurn };
    const newDifficulty = DifficultyManager.calculateDifficulty(stateForDifficulty);

    // Applica abilità extra-card se il giocatore ha il milestone
    const hasExtraCard = milestones
      .filter(m => newState.player.unlockedMilestones.includes(m.id))
      .some(m => m.ability.effect === 'extra-card');

    let finalPlayer = newState.player;
    let finalDeck = newState.technologyDeck;
    
    if (hasExtraCard) {
      if (finalDeck.length === 0) {
        finalDeck = this.shuffleArray([...technologiesData] as Technology[]);
      }
      const bonusCard = finalDeck[0];
      finalDeck = finalDeck.slice(1);
      finalPlayer = {
        ...finalPlayer,
        hand: [...finalPlayer.hand, bonusCard],
      };
    }

    // Se c'è un evento o una news, mostra la fase event
    // Altrimenti, torna direttamente a development
    const hasEvent = globalEvent !== null || newsItem !== null;
    
    return {
      ...newState,
      player: finalPlayer,
      technologyDeck: finalDeck,
      turn: newTurn,
      difficulty: newDifficulty,
      currentGlobalEvent: globalEvent,
      currentNews: newsItem,
      currentPhase: hasEvent ? 'event' : 'development',
      newlyUnlockedMilestones: null,
    };
  }

  /**
   * Completa la fase evento e avanza a development.
   * Chiamato quando il giocatore chiude la schermata evento/news.
   */
  static completeEventPhase(state: SinglePlayerState): SinglePlayerState {
    return {
      ...state,
      currentPhase: 'development',
      currentGlobalEvent: null,
      currentNews: null,
    };
  }

  /**
   * Avanza dalla fase opinion_reaction alla fase dilemma.
   * Chiamato quando l'animazione dell'opinione è finita.
   */
  static proceedFromOpinionReaction(state: SinglePlayerState): SinglePlayerState {
    // Se la tecnologia è stata respinta, salta il dilemma e chiudi il turno
    if (state.lastOpinionReaction?.isRejected) {
      return this.completeConsequencePhase(state);
    }
    
    // Altrimenti, pesca un dilemma
    return this.presentDilemma(state);
  }

  // ============================================================
  // Condizioni di fine partita
  // ============================================================

  /**
   * Verifica le condizioni di vittoria/sconfitta.
   * Include la nuova condizione sull'opinione pubblica.
   */
  static checkGameEnd(state: SinglePlayerState): {
    gameWon: boolean;
    gameLost: boolean;
    reason: string;
  } {
    const { player, publicOpinion, turn } = state;

    // VITTORIA: obiettivo raggiunto + opinione pubblica >= 40
    const objectiveComplete = player.objectiveId 
      ? Objectives.checkObjectiveCompletion(player, player.objectiveId)
      : Scoring.checkWinCondition(player);
    
    if (objectiveComplete && publicOpinion.value >= 40) {
      return {
        gameWon: true,
        gameLost: false,
        reason: 'Hai raggiunto il tuo obiettivo mantenendo il consenso pubblico!',
      };
    }

    // SCONFITTA: obiettivo raggiunto ma opinione troppo bassa
    if (objectiveComplete && publicOpinion.value < 40) {
      // Non è una sconfitta diretta, ma non può vincere senza opinione sufficiente
      // Il giocatore deve prima alzare l'opinione
    }

    // SCONFITTA: squilibrio etico
    if (Scoring.checkLoseCondition(player)) {
      return {
        gameWon: false,
        gameLost: true,
        reason: 'Il tuo approccio è troppo sbilanciato. L\'IA che hai sviluppato è eticamente inaccettabile.',
      };
    }

    // SCONFITTA: opinione pubblica in crisi per 3 turni consecutivi
    if (publicOpinion.consecutiveLowTurns >= 3) {
      return {
        gameWon: false,
        gameLost: true,
        reason: 'L\'opinione pubblica è crollata! Il governo è caduto per mancanza di consenso.',
      };
    }

    // SCONFITTA: stagnazione (turno 15+ senza raggiungere l'obiettivo)
    if (turn >= 15) {
      return {
        gameWon: false,
        gameLost: true,
        reason: 'Troppo tempo è passato senza raggiungere l\'obiettivo. Il parlamento ha revocato il mandato.',
      };
    }

    return { gameWon: false, gameLost: false, reason: '' };
  }

  // ============================================================
  // Utilità
  // ============================================================

  /**
   * Adatta SinglePlayerState a GameState per i moduli che ancora usano GameState
   * (es. GlobalEvents, che opera su un array di players)
   */
  private static adaptToGameState(state: SinglePlayerState) {
    return {
      players: [state.player],
      currentPlayerId: state.player.id,
      currentPhase: 'development' as const,
      currentDilemma: state.currentDilemma,
      currentConsequence: state.currentConsequence,
      technologyDeck: state.technologyDeck,
      dilemmaDeck: state.dilemmaDeck,
      turn: state.turn,
      gameWon: state.gameWon,
      gameLost: state.gameLost,
      winnerId: null,
      activeJoker: state.activeJoker,
      lastVoteResult: null,
      lastVoteMessage: null,
      currentGlobalEvent: state.currentGlobalEvent,
      newlyUnlockedMilestones: state.newlyUnlockedMilestones,
      currentNews: state.currentNews,
      lastNewsTurn: state.lastNewsTurn,
      resolvedDilemmaOption: state.resolvedDilemmaOption,
      lastDilemmaVoteResult: null,
      voterPointsInfo: null,
    };
  }

  /**
   * Mescola un array (Fisher-Yates)
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
