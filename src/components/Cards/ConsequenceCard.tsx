import React from 'react';
import { Consequence } from '../../game/types';
import { ArrowUp, ArrowDown, Microscope, Scale, Brain } from 'lucide-react';

interface ConsequenceCardProps {
  consequence: Consequence;
  onContinue: () => void;
  isInteractive?: boolean; // Se false, disabilita l'interazione
}

export const ConsequenceCard: React.FC<ConsequenceCardProps> = ({ consequence, onContinue, isInteractive = true }) => {
  // Crea array di effetti con icone e frecce invece di numeri
  const effects = [];
  if (consequence.effect.techPoints) {
    effects.push({
      type: 'tech',
      value: consequence.effect.techPoints,
      isPositive: consequence.effect.techPoints > 0
    });
  }
  if (consequence.effect.ethicsPoints) {
    effects.push({
      type: 'ethics',
      value: consequence.effect.ethicsPoints,
      isPositive: consequence.effect.ethicsPoints > 0
    });
  }
  if (consequence.effect.neuralformingPoints) {
    effects.push({
      type: 'neural',
      value: consequence.effect.neuralformingPoints,
      isPositive: consequence.effect.neuralformingPoints > 0
    });
  }

  // Determina se siamo in una PWA (basato sul contesto, assumiamo che se non ci sono dimensioni fisse, siamo in PWA)
  // Per ora, rendiamo sempre responsive
  const isPWA = true; // In PWA, la card dovrebbe essere full-width

  // Determina il colore in base agli effetti (verde per positivi, arancione per negativi, neutro per misti)
  const hasPositive = effects.some(e => e.isPositive);
  const hasNegative = effects.some(e => !e.isPositive);
  const cardStyle = hasNegative && !hasPositive
    ? 'bg-gradient-to-br from-orange-900/40 via-gray-800 to-red-900/30 border-2 border-orange-600/70'
    : hasPositive && !hasNegative
    ? 'bg-gradient-to-br from-green-900/40 via-gray-800 to-emerald-900/30 border-2 border-green-600/70'
    : 'bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-gray-600';

  return (
    <div 
      className={`${cardStyle} rounded-xl shadow-2xl p-4 sm:p-6 transform-gpu flex flex-col w-full`}
      style={{
        boxShadow: hasNegative && !hasPositive
          ? '0 20px 25px -5px rgba(249, 115, 22, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
          : hasPositive && !hasNegative
          ? '0 20px 25px -5px rgba(34, 197, 94, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
          : '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex-1">
          <span className={`inline-block mb-1 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded border ${
            hasNegative && !hasPositive
              ? 'bg-orange-600/30 text-orange-200 border-orange-500/50'
              : hasPositive && !hasNegative
              ? 'bg-green-600/30 text-green-200 border-green-500/50'
              : 'bg-gray-600/30 text-gray-200 border-gray-500/50'
          }`}>
            CONSEGUENZA
          </span>
          <h2 className={`font-bold text-gray-100 break-words mt-1 ${isPWA ? 'text-lg sm:text-xl' : 'text-base line-clamp-2'}`}>
            {consequence.title}
          </h2>
        </div>
        <span className={`flex-shrink-0 ${isPWA ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
          {hasNegative && !hasPositive ? '⚠️' : hasPositive && !hasNegative ? '✅' : '📊'}
        </span>
      </div>
      
      <p className={`text-gray-300 mb-3 sm:mb-4 flex-grow break-words leading-relaxed ${isPWA ? 'text-sm sm:text-base' : 'text-xs line-clamp-5 leading-tight'}`}>
        {consequence.description}
      </p>
      
      {effects.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-gray-600">
          <p className={`font-semibold text-gray-200 mb-2 ${isPWA ? 'text-xs sm:text-sm' : 'text-[10px]'}`}>Effetti:</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {effects.map((effect, index) => {
              const Icon = effect.type === 'tech' ? Microscope : effect.type === 'ethics' ? Scale : Brain;
              const ArrowIcon = effect.isPositive ? ArrowUp : ArrowDown;
              const colorClass = effect.isPositive 
                ? 'text-gray-300'
                : 'text-gray-400';
              const bgClass = effect.isPositive 
                ? 'bg-gray-700'
                : 'bg-gray-900';
              
              return (
                <div
                  key={index}
                  className={`${bgClass} ${colorClass} rounded-lg px-3 py-2 flex items-center gap-2 group relative border border-gray-600`}
                  title={`${effect.type === 'tech' ? 'Tech' : effect.type === 'ethics' ? 'Etica' : 'Neural'}: ${effect.isPositive ? '+' : ''}${effect.value}`}
                >
                  <Icon className={`${isPWA ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4'}`} />
                  <ArrowIcon className={`${isPWA ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-3 h-3'}`} />
                  <span className={`opacity-0 group-hover:opacity-100 transition-opacity font-semibold ${isPWA ? 'text-xs sm:text-sm' : 'text-[10px]'}`}>
                    {Math.abs(effect.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <button
        onClick={() => isInteractive && onContinue()}
        disabled={!isInteractive}
        className={`w-full font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-300 transform-gpu mt-auto text-sm sm:text-base ${
          isInteractive
            ? 'bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white shadow-lg hover:shadow-xl active:shadow-lg hover:scale-105 active:scale-100 cursor-pointer'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
        }`}
      >
        Continua
      </button>
    </div>
  );
};

