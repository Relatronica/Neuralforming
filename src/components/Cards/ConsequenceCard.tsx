import React from 'react';
import { Consequence } from '../../game/types';

interface ConsequenceCardProps {
  consequence: Consequence;
  onContinue: () => void;
  isInteractive?: boolean; // Se false, disabilita l'interazione
}

export const ConsequenceCard: React.FC<ConsequenceCardProps> = ({ consequence, onContinue, isInteractive = true }) => {
  const effects = [];
  if (consequence.effect.techPoints) {
    effects.push(`Tech: ${consequence.effect.techPoints > 0 ? '+' : ''}${consequence.effect.techPoints}`);
  }
  if (consequence.effect.ethicsPoints) {
    effects.push(`Etica: ${consequence.effect.ethicsPoints > 0 ? '+' : ''}${consequence.effect.ethicsPoints}`);
  }
  if (consequence.effect.neuralformingPoints) {
    effects.push(`Neural: ${consequence.effect.neuralformingPoints > 0 ? '+' : ''}${consequence.effect.neuralformingPoints}`);
  }

  // Determina se siamo in una PWA (basato sul contesto, assumiamo che se non ci sono dimensioni fisse, siamo in PWA)
  // Per ora, rendiamo sempre responsive
  const isPWA = true; // In PWA, la card dovrebbe essere full-width

  return (
    <div 
      className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-red-400 transform-gpu flex flex-col w-full"
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <h2 className={`font-bold text-gray-800 flex-1 break-words ${isPWA ? 'text-lg sm:text-xl' : 'text-base line-clamp-2'}`}>
          {consequence.title}
        </h2>
        <span className={`flex-shrink-0 ${isPWA ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>📊</span>
      </div>
      
      <p className={`text-gray-700 mb-3 sm:mb-4 flex-grow break-words leading-relaxed ${isPWA ? 'text-sm sm:text-base' : 'text-xs line-clamp-5 leading-tight'}`}>
        {consequence.description}
      </p>
      
      {effects.length > 0 && (
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <p className={`font-semibold text-gray-700 mb-2 ${isPWA ? 'text-xs sm:text-sm' : 'text-[10px]'}`}>Effetti:</p>
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {effects.map((effect, index) => (
              <span
                key={index}
                className={`bg-gray-100 text-gray-800 font-semibold px-2 py-1.5 rounded text-center ${isPWA ? 'text-xs sm:text-sm' : 'text-[9px] px-1.5 py-0.5'}`}
              >
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={() => isInteractive && onContinue()}
        disabled={!isInteractive}
        className={`w-full font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-300 transform-gpu mt-auto text-sm sm:text-base ${
          isInteractive
            ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl active:shadow-lg hover:scale-105 active:scale-100 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
        }`}
      >
        Continua
      </button>
    </div>
  );
};

