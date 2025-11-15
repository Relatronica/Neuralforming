import React from 'react';
import { Dilemma, DilemmaOption, Technology } from '../../game/types';
import { Scale, Sparkles } from 'lucide-react';

interface DilemmaCardProps {
  dilemma: Dilemma;
  onSelectOption: (option: DilemmaOption) => void;
  activeJoker?: Technology | null;
  isInteractive?: boolean; // Se false, disabilita l'interazione
}

export const DilemmaCard: React.FC<DilemmaCardProps> = ({ dilemma, onSelectOption, activeJoker, isInteractive = true }) => {
  return (
    <div 
      className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-gray-600 transform-gpu w-full max-w-full"
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 min-h-0">
        {/* Colonna sinistra - Titolo e descrizione */}
        <div className="flex flex-col min-w-0 flex-shrink-0">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-100 flex-1 break-words">{dilemma.title}</h2>
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 flex-shrink-0" />
          </div>
          
          {activeJoker && (
            <div className="mb-3 p-2 sm:p-3 bg-gray-700 rounded border border-gray-600">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 flex-shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-gray-200 break-words">Jolly Attivo: {activeJoker.name}</p>
              </div>
              {activeJoker.jokerEffect?.multiplier && (
                <p className="text-[10px] sm:text-xs text-gray-300">
                  I punti del dilemma verranno moltiplicati
                </p>
              )}
              {activeJoker.jokerEffect?.bonus && (
                <p className="text-[10px] sm:text-xs text-gray-300">
                  Bonus aggiuntivi applicati
                </p>
              )}
            </div>
          )}
          
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed flex-grow break-words overflow-y-auto">{dilemma.description}</p>
        </div>

        {/* Colonna destra - Opzioni */}
        <div className="flex flex-col min-w-0 flex-shrink-0">
          <h3 className="font-semibold text-xs sm:text-sm text-gray-100 mb-3">Scegli la tua decisione:</h3>
          <div className="space-y-2 sm:space-y-3 flex-grow min-h-0">
            {dilemma.options.map((option, index) => (
              <button
                key={index}
                onClick={() => isInteractive && onSelectOption(option)}
                disabled={!isInteractive}
                className={`w-full border-2 rounded-lg p-3 sm:p-4 text-left transition-all duration-300 transform-gpu ${
                  isInteractive
                    ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600 border-gray-600 hover:border-gray-500 active:border-gray-400 hover:shadow-md active:shadow-lg cursor-pointer'
                    : 'bg-gray-900 border-gray-700 cursor-not-allowed opacity-60'
                }`}
                style={{
                  boxShadow: isInteractive ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                }}
              >
                <p className={`text-xs sm:text-sm font-medium leading-relaxed break-words ${
                  isInteractive ? 'text-gray-100' : 'text-gray-500'
                }`}>{option.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

