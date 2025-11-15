import React from 'react';
import { Technology } from '../../game/types';
import { Sparkles, Microscope, Scale, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateVotingEffects } from '../../game/ParliamentVoting';

interface TechnologyCardProps {
  technology: Technology;
  onSelect?: (technology: Technology) => void;
  isSelectable?: boolean;
  isInHand?: boolean;
  isVotingCard?: boolean; // Se true, mostra la card in formato grande per la votazione
  showVotingEffects?: boolean; // Se true, mostra i vantaggi/svantaggi della votazione
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({
  technology,
  onSelect,
  isSelectable = false,
  isInHand = false,
  isVotingCard = false,
  showVotingEffects = false,
}) => {
  const handleClick = () => {
    if (isSelectable && onSelect) {
      onSelect(technology);
    }
  };

  const isJoker = technology.type === 'joker';

  // Calcola gli effetti della votazione se richiesto
  const votingEffects = showVotingEffects ? (() => {
    const basePoints = {
      techPoints: technology.techPoints,
      ethicsPoints: technology.ethicsPoints || 0,
      neuralformingPoints: technology.neuralformingPoints,
    };
    
    // Mostra effetti per diversi tassi di approvazione
    return {
      high: calculateVotingEffects({ votesFor: 7, votesAgainst: 1, approvalRate: 0.875, supporters: [], opponents: [] }, basePoints),
      medium: calculateVotingEffects({ votesFor: 5, votesAgainst: 3, approvalRate: 0.625, supporters: [], opponents: [] }, basePoints),
      low: calculateVotingEffects({ votesFor: 2, votesAgainst: 6, approvalRate: 0.25, supporters: [], opponents: [] }, basePoints), // Bocciata
    };
  })() : null;

  // Determina il formato della card
  const isPWA = isInHand;
  const isLargeFormat = isPWA || isVotingCard; // Formato grande per PWA o votazione
  
  // Dimensioni della card
  let cardWidth: string;
  let cardMinHeight: string;
  let cardMaxHeight: string;
  
  if (isLargeFormat) {
    // Formato grande: PWA o votazione
    cardWidth = '100%';
    cardMinHeight = 'auto';
    cardMaxHeight = 'none';
  } else {
    // Formato compatto: app principale (carte in mano)
    cardWidth = '160px';
    cardMinHeight = '240px';
    cardMaxHeight = '280px';
  }

  return (
    <div
      className={`
        rounded-xl shadow-xl p-3 sm:p-4 border-2 transition-all duration-300
        ${isJoker 
          ? 'bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-yellow-900/40 border-purple-600/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
          : 'bg-gradient-to-br from-blue-900/30 via-gray-800 to-blue-900/20 border-blue-600/70'}
        ${isSelectable ? (isJoker ? 'border-purple-500' : 'border-blue-500') + ' cursor-pointer hover:shadow-2xl active:shadow-lg hover:scale-105 active:scale-100 hover:-translate-y-1' : ''}
        ${isInHand && !isJoker ? 'bg-gradient-to-br from-blue-900/40 via-gray-800 to-blue-900/30 border-blue-600/80' : ''}
        transform-gpu flex flex-col
        ${isLargeFormat ? 'w-full' : ''}
      `}
      style={{
        width: cardWidth,
        minHeight: cardMinHeight,
        maxHeight: cardMaxHeight,
        boxShadow: isSelectable 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex-1">
          {isJoker && (
            <span className="inline-block mb-1 px-2 py-0.5 bg-purple-600/30 text-purple-200 text-[9px] sm:text-[10px] font-bold rounded border border-purple-500/50">
              BONUS
            </span>
          )}
          {!isJoker && (
            <span className="inline-block mb-1 px-2 py-0.5 bg-blue-600/30 text-blue-200 text-[9px] sm:text-[10px] font-bold rounded border border-blue-500/50">
              LEGGE
            </span>
          )}
          <h3 className={`font-bold text-gray-100 break-words mt-1 ${
            isLargeFormat 
              ? 'text-base sm:text-lg leading-relaxed' 
              : 'text-sm line-clamp-2 leading-tight'
          }`}>
            {technology.name}
          </h3>
        </div>
        {isJoker ? (
          <Sparkles className={`text-purple-300 flex-shrink-0 ${isLargeFormat ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5'}`} style={{ filter: 'drop-shadow(0 0 4px rgba(196, 181, 253, 0.6))' }} />
        ) : (
          <Microscope className={`text-blue-300 flex-shrink-0 ${isLargeFormat ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5'}`} style={{ filter: 'drop-shadow(0 0 3px rgba(96, 165, 250, 0.5))' }} />
        )}
      </div>
      
      <p className={`text-gray-300 mb-3 sm:mb-4 flex-grow break-words leading-relaxed ${
        isLargeFormat 
          ? 'text-sm sm:text-base' 
          : 'text-xs line-clamp-4 leading-tight'
      }`}>
        {technology.description}
      </p>
      
      {isJoker && technology.jokerEffect && (
        <div className={`mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-purple-900/40 to-yellow-900/30 rounded border border-purple-600/50`}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className={`w-3 h-3 ${isLargeFormat ? 'sm:w-4 sm:h-4' : ''} text-purple-300`} />
            <p className={`font-semibold text-purple-200 ${isLargeFormat ? 'text-xs sm:text-sm' : 'text-[9px]'}`}>Effetto Bonus:</p>
          </div>
          {technology.jokerEffect.multiplier && (
            <p className={`text-gray-300 ${isLargeFormat ? 'text-xs sm:text-sm' : 'text-[9px]'}`}>
              {technology.jokerEffect.multiplier.techPoints && `Tech ×${technology.jokerEffect.multiplier.techPoints} `}
              {technology.jokerEffect.multiplier.ethicsPoints && `Etica ×${technology.jokerEffect.multiplier.ethicsPoints} `}
              {technology.jokerEffect.multiplier.neuralformingPoints && `Neural ×${technology.jokerEffect.multiplier.neuralformingPoints}`}
            </p>
          )}
          {technology.jokerEffect.bonus && (
            <p className={`text-gray-300 ${isLargeFormat ? 'text-xs sm:text-sm' : 'text-[9px]'}`}>
              {technology.jokerEffect.bonus.techPoints && `Tech +${technology.jokerEffect.bonus.techPoints} `}
              {technology.jokerEffect.bonus.ethicsPoints && `Etica +${technology.jokerEffect.bonus.ethicsPoints} `}
              {technology.jokerEffect.bonus.neuralformingPoints && `Neural +${technology.jokerEffect.bonus.neuralformingPoints}`}
            </p>
          )}
        </div>
      )}
      
      {!isJoker && (
      <div className={`flex flex-col gap-2 ${isLargeFormat ? 'pt-2 sm:pt-3 border-t border-gray-600' : ''}`}>
        {/* Punti base */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Tech - Icona con intensità colore basata sul valore */}
          <div 
            className="flex items-center gap-1.5 group relative"
            title={`Tech: +${technology.techPoints}`}
          >
            <Microscope 
              className={`${isLargeFormat ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4'}`}
              style={{ 
                color: technology.techPoints >= 8 ? '#9ca3af' : technology.techPoints >= 5 ? '#d1d5db' : '#e5e7eb',
                filter: technology.techPoints >= 8 ? 'drop-shadow(0 0 4px rgba(156, 163, 175, 0.5))' : 'none'
              }}
            />
            <span className={`text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isLargeFormat ? 'text-xs sm:text-sm' : 'text-[10px]'}`}>
              +{technology.techPoints}
            </span>
          </div>
          
          {/* Etica - Icona con intensità colore basata sul valore */}
          {technology.ethicsPoints && (
            <div 
              className="flex items-center gap-1.5 group relative"
              title={`Etica: +${technology.ethicsPoints}`}
            >
              <Scale 
                className={`${isLargeFormat ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4'}`}
                style={{ 
                  color: technology.ethicsPoints >= 8 ? '#9ca3af' : technology.ethicsPoints >= 5 ? '#d1d5db' : '#e5e7eb',
                  filter: technology.ethicsPoints >= 8 ? 'drop-shadow(0 0 4px rgba(156, 163, 175, 0.5))' : 'none'
                }}
              />
              <span className={`text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isLargeFormat ? 'text-xs sm:text-sm' : 'text-[10px]'}`}>
                +{technology.ethicsPoints}
              </span>
            </div>
          )}
          
          {/* Neural - Icona con intensità colore basata sul valore */}
          <div 
            className="flex items-center gap-1.5 group relative"
            title={`Neural: +${technology.neuralformingPoints}`}
          >
            <Brain 
              className={`${isLargeFormat ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4'}`}
              style={{ 
                color: technology.neuralformingPoints >= 8 ? '#9ca3af' : technology.neuralformingPoints >= 5 ? '#d1d5db' : '#e5e7eb',
                filter: technology.neuralformingPoints >= 8 ? 'drop-shadow(0 0 4px rgba(156, 163, 175, 0.5))' : 'none'
              }}
            />
            <span className={`text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isLargeFormat ? 'text-xs sm:text-sm' : 'text-[10px]'}`}>
              +{technology.neuralformingPoints}
            </span>
          </div>
        </div>

        {/* Effetti della votazione (se mostrati) */}
        {showVotingEffects && votingEffects && (
          <div className={`mt-2 p-2 bg-gray-700/50 rounded border border-gray-600 ${isLargeFormat ? 'text-xs' : 'text-[10px]'}`}>
            <p className="text-gray-300 mb-1.5 font-semibold">Effetti Votazione:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-gray-300">Alta approvazione (&gt;70%):</span>
                <span className="text-green-400 font-semibold">
                  +{votingEffects.high.techPoints} Tech, +{votingEffects.high.ethicsPoints} Etica, +{votingEffects.high.neuralformingPoints} Neural
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-300 ml-4">Media (&gt;50%):</span>
                <span className="text-yellow-400 font-semibold">
                  +{votingEffects.medium.techPoints} Tech, +{votingEffects.medium.ethicsPoints} Etica, +{votingEffects.medium.neuralformingPoints} Neural
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-gray-300">Bocciata (&lt;50%):</span>
                <span className="text-red-400 font-semibold">
                  {votingEffects.low.techPoints} Tech, {votingEffects.low.ethicsPoints} Etica, {votingEffects.low.neuralformingPoints} Neural
                  <span className="ml-1 text-xs">(legge non passa)</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

