import React from 'react';
import { Technology } from '../../game/types';
import { Sparkles, Microscope, Scale, Brain } from 'lucide-react';

interface TechnologyCardProps {
  technology: Technology;
  onSelect?: (technology: Technology) => void;
  isSelectable?: boolean;
  isInHand?: boolean;
  isVotingCard?: boolean; // Se true, mostra la card in formato grande per la votazione
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({
  technology,
  onSelect,
  isSelectable = false,
  isInHand = false,
  isVotingCard = false,
}) => {
  const handleClick = () => {
    if (isSelectable && onSelect) {
      onSelect(technology);
    }
  };

  const isJoker = technology.type === 'joker';

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
          ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600' 
          : 'bg-gray-800 border-gray-600'}
        ${isSelectable ? (isJoker ? 'border-gray-500' : 'border-gray-500') + ' cursor-pointer hover:shadow-2xl active:shadow-lg hover:scale-105 active:scale-100 hover:-translate-y-1' : ''}
        ${isInHand && !isJoker ? 'bg-gradient-to-br from-gray-800 to-gray-700' : ''}
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
        <h3 className={`font-bold text-gray-100 flex-1 break-words ${
          isLargeFormat 
            ? 'text-base sm:text-lg leading-relaxed' 
            : 'text-sm line-clamp-2 leading-tight'
        }`}>
          {technology.name}
        </h3>
        {isJoker ? (
          <Sparkles className={`text-gray-300 flex-shrink-0 ${isLargeFormat ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5'}`} />
        ) : (
          <Microscope className={`text-gray-300 flex-shrink-0 ${isLargeFormat ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5'}`} />
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
        <div className={`mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-700 rounded border border-gray-600`}>
          <p className={`font-semibold text-gray-200 mb-1 ${isLargeFormat ? 'text-xs sm:text-sm' : 'text-[9px]'}`}>Effetto Jolly:</p>
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
      <div className={`flex flex-wrap gap-2 sm:gap-3 mt-auto ${isLargeFormat ? 'pt-2 sm:pt-3 border-t border-gray-600' : ''}`}>
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
      )}
    </div>
  );
};

