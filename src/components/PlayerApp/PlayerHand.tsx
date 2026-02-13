import React, { useState, useEffect } from 'react';
import { GameState, PlayerState, Technology } from '../../game/types';
import { TechnologyCard } from '../Cards/TechnologyCard';
import { Plus, Hand, ScrollText, Brain, Scale, Microscope, Trophy, Sparkles, Target, Users, Loader2, ArrowRight, BarChart3, AlertTriangle } from 'lucide-react';
import { milestones } from '../../game/Milestones';
import { Objectives } from '../../game/Objectives';

interface PlayerHandProps {
  player: PlayerState;
  gameState: GameState;
  isMyTurn: boolean;
  currentPlayerName: string;
  onDrawTechnology: () => void;
  onAddTechnology: (technology: Technology) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  gameState,
  isMyTurn,
  currentPlayerName,
  onDrawTechnology,
  onAddTechnology,
}) => {
  const [activeTab, setActiveTab] = useState<'hand' | 'laws' | 'milestones' | 'objective'>('hand');
  const [hasProposedTechnology, setHasProposedTechnology] = useState(false);
  const [confirmingTech, setConfirmingTech] = useState<Technology | null>(null);
  
  // Reset quando cambia il turno
  useEffect(() => {
    // Se non è più il nostro turno, resetta il flag
    if (gameState.currentPlayerId !== player.id) {
      setHasProposedTechnology(false);
      return;
    }
    
    // Se è il nostro turno e siamo tornati alla fase 'development' 
    // senza dilemma o consequence in corso, significa che è un nuovo turno
    if (gameState.currentPhase === 'development' && 
        gameState.currentPlayerId === player.id &&
        !gameState.currentDilemma && 
        !gameState.currentConsequence) {
      // È un nuovo turno, resetta il flag
      setHasProposedTechnology(false);
    }
  }, [gameState.currentPhase, gameState.currentPlayerId, gameState.currentDilemma, gameState.currentConsequence, player.id]);
  
  // Verifica se il giocatore può ancora proporre tecnologie
  // Non può proporre se:
  // 1. Ha già proposto una tecnologia in questo turno (stato locale)
  // 2. La fase non è più 'development' (dilemma o consequence in corso)
  // 3. Non è il suo turno
  const canProposeTechnology = !hasProposedTechnology && gameState.currentPhase === 'development' && isMyTurn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-3 sm:p-4 pb-6 sm:pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header con tabs */}
        <div className="bg-gray-900 rounded-xl shadow-2xl p-3 sm:p-4 mb-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-700 pb-2">
            {activeTab === 'hand' ? (
              <Hand className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100 flex-shrink-0" />
            ) : activeTab === 'laws' ? (
              <ScrollText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100 flex-shrink-0" />
            ) : activeTab === 'milestones' ? (
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100 flex-shrink-0" />
            ) : (
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100 flex-shrink-0" />
            )}
            <h1 className="text-base sm:text-xl font-bold text-gray-100 truncate flex-1">
              {activeTab === 'hand' ? 'Le Tue Proposte' : activeTab === 'laws' ? 'Leggi Approvate' : activeTab === 'milestones' ? 'I Tuoi Milestone' : 'Il Tuo Obiettivo'}
            </h1>
          </div>
          
          {/* Tabs - Layout compatto per evitare overflow */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2" data-tour="tabs">
            <button
              onClick={() => setActiveTab('hand')}
              className={`py-2 px-1.5 sm:px-3 text-xs font-semibold rounded-lg transition-colors duration-200 min-w-0 ${
                activeTab === 'hand'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
              data-tour="hand-tab"
            >
              <div className="flex flex-col items-center gap-1">
                <Hand className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                  <span className="hidden sm:inline">Proposte</span>
                  <span className="sm:hidden">{player.hand.length}</span>
                </span>
                <span className="hidden sm:block text-[9px] opacity-75">
                  ({player.hand.length})
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('laws')}
              className={`py-2 px-1.5 sm:px-3 text-xs font-semibold rounded-lg transition-colors duration-200 min-w-0 ${
                activeTab === 'laws'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
              data-tour="laws-tab"
            >
              <div className="flex flex-col items-center gap-1">
                <ScrollText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                  <span className="hidden sm:inline">Leggi</span>
                  <span className="sm:hidden">{player.technologies.length}</span>
                </span>
                <span className="hidden sm:block text-[9px] opacity-75">
                  ({player.technologies.length}/5)
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-2 px-1.5 sm:px-3 text-xs font-semibold rounded-lg transition-colors duration-200 min-w-0 ${
                activeTab === 'milestones'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
              data-tour="milestones-tab"
            >
              <div className="flex flex-col items-center gap-1">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                  <span className="hidden sm:inline">Milestone</span>
                  <span className="sm:hidden">{player.unlockedMilestones?.length || 0}</span>
                </span>
                <span className="hidden sm:block text-[9px] opacity-75">
                  ({player.unlockedMilestones?.length || 0})
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('objective')}
              className={`py-2 px-1.5 sm:px-3 text-xs font-semibold rounded-lg transition-colors duration-200 min-w-0 ${
                activeTab === 'objective'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
              data-tour="objective-tab"
            >
              <div className="flex flex-col items-center gap-1">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                  <span className="hidden sm:inline">Obiettivo</span>
                  <span className="sm:hidden">Target</span>
                </span>
                <span className="hidden sm:block text-[9px] opacity-75">
                  Missione
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Modale di conferma proposta */}
        {confirmingTech && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-gray-100">Conferma Proposta</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Stai per proporre <span className="font-bold text-gray-100">{confirmingTech.name}</span>. 
                Tutti i giocatori voteranno su questa proposta. Puoi proporre <span className="font-bold text-amber-300">una sola legge per turno</span>.
              </p>
              <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-700">
                <TechnologyCard
                  technology={confirmingTech}
                  isSelectable={false}
                  isInHand={false}
                  showVotingEffects={false}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmingTech(null)}
                  className="py-3 px-4 rounded-lg font-semibold text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    setHasProposedTechnology(true);
                    onAddTechnology(confirmingTech);
                    setConfirmingTech(null);
                  }}
                  className="py-3 px-4 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transition-all shadow-md hover:shadow-lg"
                >
                  Proponi Legge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenuto tab Proposte */}
        {activeTab === 'hand' && (
          <>
            {!isMyTurn ? (
              // Stato partita live durante l'attesa (NON più semplice spinner)
              <div className="space-y-3">
                {/* Chi sta giocando */}
                <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-5 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-600/20 rounded-full p-2">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-100">
                        Turno di {currentPlayerName}
                      </h2>
                      <p className="text-gray-400 text-xs">
                        Fase: {gameState.currentPhase === 'development' ? 'Sviluppo' : gameState.currentPhase === 'dilemma' ? 'Dilemma Etico' : gameState.currentPhase === 'consequence' ? 'Conseguenza' : gameState.currentPhase}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span>In attesa del tuo turno...</span>
                  </div>
                </div>

                {/* Ordine turni */}
                <div className="bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-200">Ordine Turni</h3>
                  </div>
                  <div className="space-y-1.5">
                    {gameState.players.map((p, idx) => {
                      const isCurrent = p.id === gameState.currentPlayerId;
                      const isMe = p.id === player.id;
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                            isCurrent ? 'bg-blue-900/30 border border-blue-600/30' : isMe ? 'bg-gray-800 border border-gray-600' : 'bg-gray-800/50'
                          }`}
                        >
                          <span className="text-gray-500 w-4 text-center font-mono">{idx + 1}</span>
                          <span className={`font-semibold ${isCurrent ? 'text-blue-300' : isMe ? 'text-gray-100' : 'text-gray-400'}`}>
                            {p.name}{isMe ? ' (tu)' : ''}
                          </span>
                          {isCurrent && <span className="ml-auto text-blue-400 text-xs font-bold">IN GIOCO</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Riepilogo rapido punti */}
                <div className="bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-200">I tuoi punti</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-800 rounded-lg p-2 text-center border border-blue-900/30">
                      <Microscope className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-blue-300">{player.techPoints}</p>
                      <p className="text-xs text-gray-500">Tech</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2 text-center border border-emerald-900/30">
                      <Scale className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-emerald-300">{player.ethicsPoints}</p>
                      <p className="text-xs text-gray-500">Etica</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2 text-center border border-purple-900/30">
                      <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-purple-300">{player.neuralformingPoints}</p>
                      <p className="text-xs text-gray-500">Neural</p>
                    </div>
                  </div>
                </div>

                {/* Suggerimento tab */}
                <p className="text-center text-gray-500 text-xs">
                  Usa le tab sopra per consultare obiettivo, leggi e milestone
                </p>
              </div>
            ) : player.hand.length === 0 ? (
              <div className="bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 text-center border border-gray-700">
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Non hai proposte disponibili</p>
                <button
                  onClick={onDrawTechnology}
                  className="w-full bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg active:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                  data-tour="draw-button"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  Pesca una Nuova Proposta
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {!canProposeTechnology && (
                  <div className="bg-gray-800 border border-gray-600 rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-sm sm:text-base text-gray-300 font-semibold">
                      {hasProposedTechnology 
                        ? "Hai già proposto una legge in questo turno. Attendi il prossimo turno."
                        : "Non puoi proporre leggi in questo momento."}
                    </p>
                  </div>
                )}
                {player.hand.map((tech) => (
                  <div key={tech.id} className="bg-gray-900 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition-shadow duration-200 border border-gray-700">
                    <TechnologyCard
                      technology={tech}
                      onSelect={(tech) => {
                        if (canProposeTechnology) {
                          // Apri il modale di conferma invece di proporre subito
                          setConfirmingTech(tech);
                        }
                      }}
                      isSelectable={canProposeTechnology}
                      isInHand={true}
                      showVotingEffects={false}
                    />
                  </div>
                ))}
                <button
                  onClick={onDrawTechnology}
                  className="w-full bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg active:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base mt-4"
                  data-tour="draw-button"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  Pesca una Nuova Proposta
                </button>
              </div>
            )}
          </>
        )}

        {/* Contenuto tab Leggi Approvate */}
        {activeTab === 'laws' && (
          <div className="space-y-3 sm:space-y-4">
            {player.technologies.length === 0 ? (
              <div className="bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 text-center border border-gray-700">
                <ScrollText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-300 text-sm sm:text-base mb-2">Nessuna legge approvata ancora</p>
                <p className="text-gray-400 text-xs sm:text-sm">Presenta proposte per iniziare</p>
              </div>
            ) : (
              player.technologies.map((tech, index) => (
                <div
                  key={tech.id}
                  className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-5 hover:shadow-xl transition-shadow duration-200 border-l-4 border-gray-600 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-600 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-gray-100">
                          {tech.name}
                        </h3>
                      </div>
                      <p className="text-sm sm:text-base text-gray-300 mb-3 leading-relaxed">
                        {tech.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tech.techPoints > 0 && (
                      <span className="flex items-center gap-1 bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs sm:text-sm font-semibold border border-gray-700">
                        <Microscope className="w-3 h-3 sm:w-4 sm:h-4" />
                        +{tech.techPoints} Tech
                      </span>
                    )}
                    {tech.ethicsPoints && tech.ethicsPoints > 0 && (
                      <span className="flex items-center gap-1 bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs sm:text-sm font-semibold border border-gray-700">
                        <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                        +{tech.ethicsPoints} Etica
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs sm:text-sm font-semibold border border-gray-700">
                      <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                      +{tech.neuralformingPoints} Neural
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contenuto tab Milestone */}
        {activeTab === 'milestones' && (
          <div className="space-y-3 sm:space-y-4">
            {!player.unlockedMilestones || player.unlockedMilestones.length === 0 ? (
              <div className="bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 text-center border border-gray-700">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-300 text-sm sm:text-base mb-2">Nessun milestone raggiunto ancora</p>
                <p className="text-gray-400 text-xs sm:text-sm">Raggiungi obiettivi per sbloccare abilità speciali</p>
              </div>
            ) : (
              player.unlockedMilestones.map((milestoneId) => {
                const milestone = milestones.find(m => m.id === milestoneId);
                if (!milestone) return null;
                
                return (
                  <div
                    key={milestone.id}
                    className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-5 hover:shadow-xl transition-shadow duration-200 border-l-4 border-gray-500 border border-gray-700"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-gray-800 rounded-full p-2 flex-shrink-0 border border-gray-700">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-100 mb-1">
                          {milestone.name}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-300 mb-3 leading-relaxed">
                          {milestone.description}
                        </p>
                        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-gray-200 mb-1">
                                {milestone.ability.name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                                {milestone.ability.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Contenuto tab Obiettivo */}
        {activeTab === 'objective' && (
          <div className="space-y-3 sm:space-y-4">
            {!player.objectiveId ? (
              <div className="bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 text-center border border-gray-700">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-300 text-sm sm:text-base mb-2">Nessun obiettivo assegnato</p>
                <p className="text-gray-400 text-xs sm:text-sm">Un obiettivo verrà assegnato all'inizio della partita</p>
              </div>
            ) : (() => {
              const objective = Objectives.getObjectiveById(player.objectiveId);
              if (!objective) return null;

              const progressDetails = Objectives.getObjectiveProgressDetails(player, player.objectiveId);
              
              return (
                <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700">
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                      <h2 className="text-lg sm:text-xl font-bold text-gray-100">
                        {objective.title}
                      </h2>
                    </div>
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4">
                      {objective.description}
                    </p>
                    
                    {/* Progresso complessivo */}
                    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-300">Progresso Complessivo</span>
                        <span className={`text-sm sm:text-base font-bold ${
                          progressDetails.completed ? 'text-green-400' : 'text-gray-100'
                        }`}>
                          {progressDetails.overallProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 sm:h-4">
                        <div
                          className={`h-3 sm:h-4 rounded-full transition-all duration-500 ${
                            progressDetails.completed 
                              ? 'bg-gradient-to-r from-green-500 to-green-400' 
                              : 'bg-gradient-to-r from-gray-500 to-gray-400'
                          }`}
                          style={{ width: `${Math.min(100, progressDetails.overallProgress)}%` }}
                        />
                      </div>
                      {progressDetails.completed && (
                        <p className="text-xs sm:text-sm text-green-400 font-semibold mt-2 text-center">
                          ✓ Obiettivo Raggiunto!
                        </p>
                      )}
                    </div>

                    {/* Dettagli requisiti */}
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-200 mb-2">
                        Requisiti:
                      </h3>
                      {progressDetails.details.map((detail, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-semibold text-gray-300">
                              {detail.requirement}
                            </span>
                            <span className={`text-xs sm:text-sm font-bold ${
                              detail.progress >= 100 ? 'text-green-400' : 'text-gray-200'
                            }`}>
                              {detail.current} / {detail.target}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                detail.progress >= 100 
                                  ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                  : 'bg-gradient-to-r from-gray-500 to-gray-400'
                              }`}
                              style={{ width: `${Math.min(100, detail.progress)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

