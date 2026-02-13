import React, { useState, useCallback, useEffect } from 'react';
import { SinglePlayerEngine } from '../../game/SinglePlayerEngine';
import { SinglePlayerState } from '../../game/singlePlayerTypes';
import { Technology, DilemmaOption } from '../../game/types';
import { Objectives } from '../../game/Objectives';
import { Scoring } from '../../game/Scoring';
import { milestones } from '../../game/Milestones';
import { DifficultyManager } from '../../game/DifficultyManager';
import { TechnologyCard } from '../Cards/TechnologyCard';
import { DilemmaCard } from '../Cards/DilemmaCard';
import { ConsequenceCard } from '../Cards/ConsequenceCard';
import { GlobalEventCard } from '../Game/GlobalEventCard';
import { NewsCard } from '../Game/NewsCard';
import { MilestoneUnlockAnimation } from '../Game/MilestoneUnlockAnimation';
import { DilemmaTransitionScreen } from '../Game/DilemmaTransitionScreen';
import { OpeningStoryModal } from '../Game/OpeningStoryModal';
import { SinglePlayerDashboard } from './SinglePlayerDashboard';
import { PublicOpinionMeter } from './PublicOpinionMeter';
import { 
  ArrowLeft, 
  Plus, 
  Brain, 
  Microscope, 
  Scale, 
  Trophy, 
  RotateCcw,
  Sparkles,
  BookOpen,
  Target,
  ChevronRight,
} from 'lucide-react';

interface SinglePlayerGameProps {
  onBackToSetup?: () => void;
}

export const SinglePlayerGame: React.FC<SinglePlayerGameProps> = ({ onBackToSetup }) => {
  // ============================================================
  // State
  // ============================================================

  const [gameState, setGameState] = useState<SinglePlayerState>(() => 
    SinglePlayerEngine.initializeGame()
  );
  
  const [showOpeningStory, setShowOpeningStory] = useState(true);
  const [showDilemmaTransition, setShowDilemmaTransition] = useState(false);
  const [showMilestoneAnimation, setShowMilestoneAnimation] = useState(false);
  const [milestoneAnimationName, setMilestoneAnimationName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  // ============================================================
  // Derived state
  // ============================================================

  const { player, currentPhase, publicOpinion, lastOpinionReaction } = gameState;
  const hasCardsInHand = player.hand.length > 0;
  const objective = player.objectiveId ? Objectives.getObjectiveById(player.objectiveId) : null;

  // ============================================================
  // Milestone animation effect
  // ============================================================

  useEffect(() => {
    if (gameState.newlyUnlockedMilestones && gameState.newlyUnlockedMilestones.length > 0) {
      const milestone = milestones.find(
        m => m.id === gameState.newlyUnlockedMilestones![0].milestoneId
      );
      if (milestone) {
        setMilestoneAnimationName(milestone.name);
        setShowMilestoneAnimation(true);
      }
    }
  }, [gameState.newlyUnlockedMilestones]);

  // ============================================================
  // Handlers
  // ============================================================

  /** Pesca nuove carte */
  const handleDrawCards = useCallback(() => {
    setIsDrawing(true);
    setTimeout(() => {
      setGameState(prev => SinglePlayerEngine.drawCards(prev));
      setIsDrawing(false);
    }, 300);
  }, []);

  /** Gioca una tecnologia dalla mano */
  const handlePlayTechnology = useCallback((technology: Technology) => {
    const newState = SinglePlayerEngine.proposeTechnology(gameState, technology);
    setGameState(newState);
  }, [gameState]);

  /** Procedi dalla reazione opinione al dilemma */
  const handleProceedFromOpinion = useCallback(() => {
    setShowDilemmaTransition(true);
  }, []);

  /** Transizione dilemma completata */
  const handleDilemmaTransitionComplete = useCallback(() => {
    setShowDilemmaTransition(false);
    setGameState(prev => SinglePlayerEngine.proceedFromOpinionReaction(prev));
  }, []);

  /** Risolvi un dilemma */
  const handleResolveDilemma = useCallback((option: DilemmaOption) => {
    const newState = SinglePlayerEngine.resolveDilemma(gameState, option);
    setGameState(newState);
  }, [gameState]);

  /** Completa la fase conseguenza */
  const handleCompleteConsequence = useCallback(() => {
    const newState = SinglePlayerEngine.completeConsequencePhase(gameState);
    setGameState(newState);
  }, [gameState]);

  /** Chiudi evento/news */
  const handleDismissEvent = useCallback(() => {
    setGameState(prev => SinglePlayerEngine.completeEventPhase(prev));
  }, []);

  /** Nuova partita */
  const handleNewGame = useCallback(() => {
    setGameState(SinglePlayerEngine.initializeGame());
    setShowOpeningStory(true);
  }, []);

  // ============================================================
  // Render: Opening Story
  // ============================================================

  if (showOpeningStory) {
    return <OpeningStoryModal onClose={() => setShowOpeningStory(false)} />;
  }

  // ============================================================
  // Render: Transition screens
  // ============================================================

  if (showDilemmaTransition) {
    return <DilemmaTransitionScreen onComplete={handleDilemmaTransitionComplete} duration={1500} />;
  }

  if (showMilestoneAnimation) {
    return (
      <MilestoneUnlockAnimation 
        milestoneName={milestoneAnimationName}
        onComplete={() => setShowMilestoneAnimation(false)}
        duration={1800}
      />
    );
  }

  // ============================================================
  // Render: Game Over
  // ============================================================

  if (currentPhase === 'gameOver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className={`rounded-2xl p-8 border-2 text-center ${
            gameState.gameWon 
              ? 'bg-gradient-to-br from-emerald-900/50 to-gray-900 border-emerald-600' 
              : 'bg-gradient-to-br from-red-900/50 to-gray-900 border-red-600'
          }`}>
            {/* Icon */}
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              gameState.gameWon ? 'bg-emerald-900/50' : 'bg-red-900/50'
            }`}>
              {gameState.gameWon 
                ? <Trophy className="w-10 h-10 text-amber-400" />
                : <Brain className="w-10 h-10 text-red-400" />
              }
            </div>

            {/* Title */}
            <h1 className={`text-3xl font-bold mb-2 ${
              gameState.gameWon ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {gameState.gameWon ? 'Vittoria!' : 'Sconfitta'}
            </h1>

            {/* Reason */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              {gameState.gameOverReason}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-800/60 rounded-lg p-3">
                <Microscope className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{player.techPoints}</p>
                <p className="text-[10px] text-gray-500">Tecnologia</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <Scale className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{player.ethicsPoints}</p>
                <p className="text-[10px] text-gray-500">Etica</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <Brain className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{player.neuralformingPoints}</p>
                <p className="text-[10px] text-gray-500">Neuralforming</p>
              </div>
            </div>

            {/* Objective completion */}
            {objective && (
              <div className="mb-6 p-3 bg-gray-800/40 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-gray-300">{objective.title}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Turni giocati: {gameState.turn} | Opinione finale: {publicOpinion.value}%
                </p>
              </div>
            )}

            {/* Extra stats */}
            <div className="flex justify-center gap-4 mb-6 text-xs text-gray-500">
              <span>Bilanciamento: {Math.round(Scoring.calculateBalance(player) * 100)}%</span>
              <span>Tecnologie: {player.technologies.length}</span>
              <span>Milestone: {player.unlockedMilestones.length}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleNewGame}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Nuova Partita
              </button>
              {onBackToSetup && (
                <button
                  onClick={onBackToSetup}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Menu
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Main game layout
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToSetup && (
            <button
              onClick={onBackToSetup}
              className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-400" />
            <h1 className="text-sm font-bold text-gray-200">Neuralforming</h1>
            <span className="text-[10px] px-2 py-0.5 bg-blue-900/40 text-blue-400 rounded-full">
              Single Player
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Turno {gameState.turn}/15</span>
          <span className={DifficultyManager.getDifficultyInfo(gameState.difficulty).color}>
            {DifficultyManager.getDifficultyInfo(gameState.difficulty).label}
          </span>
        </div>
      </header>

      {/* Main content: 2 columns */}
      <div className="flex h-[calc(100vh-49px)]">
        
        {/* Left: Gameplay area (70%) */}
        <main className="flex-1 overflow-y-auto p-4">
          {renderPhaseContent()}
        </main>

        {/* Right: Dashboard (30%) */}
        <aside className="w-80 border-l border-gray-800 bg-gray-900/50 p-3 overflow-hidden">
          <SinglePlayerDashboard state={gameState} />
        </aside>
      </div>
    </div>
  );

  // ============================================================
  // Phase Content Renderer
  // ============================================================

  function renderPhaseContent() {
    switch (currentPhase) {
      case 'development':
        return renderDevelopmentPhase();
      case 'opinion_reaction':
        return renderOpinionReactionPhase();
      case 'dilemma':
        return renderDilemmaPhase();
      case 'consequence':
        return renderConsequencePhase();
      case 'event':
        return renderEventPhase();
      default:
        return null;
    }
  }

  // ============================================================
  // DEVELOPMENT PHASE
  // ============================================================

  function renderDevelopmentPhase() {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Phase header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-gray-100">Fase di Sviluppo</h2>
          </div>
          <p className="text-sm text-gray-400">
            Scegli una tecnologia dalla tua mano per proporla al parlamento.
          </p>
        </div>

        {/* Draw cards button */}
        {!hasCardsInHand && (
          <div className="text-center mb-6">
            <button
              onClick={handleDrawCards}
              disabled={isDrawing}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium 
                hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-900/30
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              {isDrawing ? 'Pescando...' : `Pesca ${DifficultyManager.getCardsToDrawCount(gameState.difficulty)} Carte`}
            </button>
          </div>
        )}

        {/* Hand */}
        {hasCardsInHand && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-400">
                La tua mano ({player.hand.length} carte)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {player.hand.map(tech => (
                <TechnologyCard
                  key={tech.id}
                  technology={tech}
                  onSelect={handlePlayTechnology}
                  isSelectable={true}
                  isInHand={true}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              Clicca su una carta per proporla. L'opinione pubblica reagira alla tua scelta.
            </p>
          </div>
        )}

        {/* Implemented technologies */}
        {player.technologies.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Tecnologie implementate ({player.technologies.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {player.technologies.map(tech => (
                <div 
                  key={tech.id} 
                  className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded text-[11px] text-gray-400"
                  title={tech.description}
                >
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // OPINION REACTION PHASE
  // ============================================================

  function renderOpinionReactionPhase() {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full">
          {/* Opinion reaction display */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-100 mb-2">
              Reazione dell'Opinione Pubblica
            </h2>
            <p className="text-sm text-gray-400">
              {lastOpinionReaction?.isRejected 
                ? 'La proposta e stata respinta dall\'opinione pubblica!'
                : 'Ecco come il pubblico ha reagito alla tua proposta...'
              }
            </p>
          </div>

          {/* Enlarged opinion meter */}
          <div className="mb-6">
            <PublicOpinionMeter 
              opinion={publicOpinion} 
              reaction={lastOpinionReaction}
              showDetails={true}
            />
          </div>

          {/* Effectiveness info */}
          {lastOpinionReaction && !lastOpinionReaction.isRejected && (
            <div className="text-center mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                lastOpinionReaction.effectivenessMultiplier > 1 
                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                  : lastOpinionReaction.effectivenessMultiplier < 1
                    ? 'bg-red-900/30 text-red-400 border border-red-800'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                Efficacia punti: {Math.round(lastOpinionReaction.effectivenessMultiplier * 100)}%
              </span>
            </div>
          )}

          {/* Continue button */}
          <div className="text-center">
            <button
              onClick={handleProceedFromOpinion}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto ${
                lastOpinionReaction?.isRejected
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg'
              }`}
            >
              {lastOpinionReaction?.isRejected ? (
                <>Continua <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Affronta il Dilemma <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DILEMMA PHASE
  // ============================================================

  function renderDilemmaPhase() {
    if (!gameState.currentDilemma) return null;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-100 mb-1">Dilemma Etico</h2>
          <p className="text-sm text-gray-400">
            Fai la tua scelta. Ogni opzione avra conseguenze diverse sull'opinione pubblica e sui tuoi punteggi.
          </p>
        </div>

        <DilemmaCard
          dilemma={gameState.currentDilemma}
          onSelectOption={handleResolveDilemma}
          activeJoker={gameState.activeJoker}
          isInteractive={true}
          showOptions={true}
        />
      </div>
    );
  }

  // ============================================================
  // CONSEQUENCE PHASE
  // ============================================================

  function renderConsequencePhase() {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-100 mb-1">Conseguenza</h2>
          <p className="text-sm text-gray-400">
            La tua scelta ha generato delle conseguenze...
          </p>
        </div>

        {/* Show resolved dilemma option */}
        {gameState.resolvedDilemmaOption && (
          <div className="mb-4 p-3 bg-gray-800/60 border border-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">La tua scelta:</p>
            <p className="text-sm text-gray-300">{gameState.resolvedDilemmaOption.text}</p>
          </div>
        )}

        {gameState.currentConsequence ? (
          <ConsequenceCard
            consequence={gameState.currentConsequence}
            onContinue={handleCompleteConsequence}
            isInteractive={true}
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Nessuna conseguenza aggiuntiva.</p>
            <button
              onClick={handleCompleteConsequence}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium 
                hover:from-blue-500 hover:to-blue-600 transition-all flex items-center gap-2 mx-auto"
            >
              Continua <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // EVENT PHASE
  // ============================================================

  function renderEventPhase() {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        {gameState.currentGlobalEvent && (
          <div className="mb-4 w-full">
            <GlobalEventCard 
              event={gameState.currentGlobalEvent} 
              onDismiss={handleDismissEvent} 
            />
          </div>
        )}
        
        {gameState.currentNews && !gameState.currentGlobalEvent && (
          <div className="w-full">
            <NewsCard 
              news={gameState.currentNews} 
              onDismiss={handleDismissEvent} 
            />
          </div>
        )}

        {/* Fallback if neither event nor news */}
        {!gameState.currentGlobalEvent && !gameState.currentNews && (
          <div className="text-center">
            <button
              onClick={handleDismissEvent}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium"
            >
              Continua <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        )}
      </div>
    );
  }
};
