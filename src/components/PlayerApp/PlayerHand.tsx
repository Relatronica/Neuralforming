import React, { useState, useEffect } from 'react';
import { GameState, PlayerState, Technology } from '../../game/types';
import { TechnologyCard } from '../Cards/TechnologyCard';
import { Plus, Hand, ScrollText, Brain, Scale, Microscope, Trophy, Sparkles } from 'lucide-react';
import { milestones } from '../../game/Milestones';

interface PlayerHandProps {
  player: PlayerState;
  gameState: GameState;
  onDrawTechnology: () => void;
  onAddTechnology: (technology: Technology) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  gameState,
  onDrawTechnology,
  onAddTechnology,
}) => {
  const [activeTab, setActiveTab] = useState<'hand' | 'laws' | 'milestones'>('hand');
  const [hasProposedTechnology, setHasProposedTechnology] = useState(false);
  
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
  const isMyTurn = gameState.currentPlayerId === player.id;
  const canProposeTechnology = !hasProposedTechnology && gameState.currentPhase === 'development' && isMyTurn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-3 sm:p-4 pb-6 sm:pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header con tabs */}
        <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 mb-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            {activeTab === 'hand' ? (
              <Hand className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100 flex-shrink-0" />
            ) : activeTab === 'laws' ? (
              <ScrollText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100 flex-shrink-0" />
            ) : (
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100 flex-shrink-0" />
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
              {activeTab === 'hand' ? 'Le Tue Proposte' : activeTab === 'laws' ? 'Leggi Approvate' : 'I Tuoi Milestone'}
            </h1>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('hand')}
              className={`flex-1 py-2 px-4 text-sm sm:text-base font-semibold rounded-t-lg transition-colors duration-200 ${
                activeTab === 'hand'
                  ? 'bg-gray-600 text-white border-b-2 border-gray-500'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Hand className="w-4 h-4" />
                <span>Proposte ({player.hand.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('laws')}
              className={`flex-1 py-2 px-4 text-sm sm:text-base font-semibold rounded-t-lg transition-colors duration-200 ${
                activeTab === 'laws'
                  ? 'bg-gray-600 text-white border-b-2 border-gray-500'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ScrollText className="w-4 h-4" />
                <span>Leggi ({player.technologies.length}/5)</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`flex-1 py-2 px-4 text-sm sm:text-base font-semibold rounded-t-lg transition-colors duration-200 ${
                activeTab === 'milestones'
                  ? 'bg-gray-600 text-white border-b-2 border-gray-500'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Milestone ({player.unlockedMilestones?.length || 0})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Contenuto tab Proposte */}
        {activeTab === 'hand' && (
          <>
            {player.hand.length === 0 ? (
              <div className="bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 text-center border border-gray-700">
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Non hai proposte disponibili</p>
                <button
                  onClick={onDrawTechnology}
                  className="w-full bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg active:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
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
                          setHasProposedTechnology(true);
                          onAddTechnology(tech);
                        }
                      }}
                      isSelectable={canProposeTechnology}
                      isInHand={true}
                    />
                  </div>
                ))}
                <button
                  onClick={onDrawTechnology}
                  className="w-full bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg active:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base mt-4"
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
      </div>
    </div>
  );
};

