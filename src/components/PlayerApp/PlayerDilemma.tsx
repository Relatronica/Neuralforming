import React from 'react';
import { Dilemma, DilemmaOption, Technology } from '../../game/types';
import { DilemmaCard } from '../Cards/DilemmaCard';
import { Scale } from 'lucide-react';

interface PlayerDilemmaProps {
  dilemma: Dilemma;
  activeJoker?: Technology | null;
  onResolve: (option: DilemmaOption) => void;
}

export const PlayerDilemma: React.FC<PlayerDilemmaProps> = ({
  dilemma,
  activeJoker,
  onResolve,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-3 sm:p-4 pb-6 sm:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Dilemma Etico
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 overflow-hidden">
          <DilemmaCard
            dilemma={dilemma}
            onSelectOption={onResolve}
            activeJoker={activeJoker}
          />
        </div>
      </div>
    </div>
  );
};

