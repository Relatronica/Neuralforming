import React from 'react';
import { Technology, PlayerState } from '../../game/types';
import { Scoring } from '../../game/Scoring';
import { ParliamentHemicycle } from './ParliamentHemicycle';
import { Landmark, Brain, Scale, Microscope } from 'lucide-react';

interface BoardProps {
  technologies: Technology[];
  players: PlayerState[];
  currentPlayerId: string;
}

export const Board: React.FC<BoardProps> = ({ technologies, players, currentPlayerId }) => {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  if (!currentPlayer) return null;

  // Calcola progressi verso gli obiettivi
  const neuralformingProgress = Math.min(100, Math.round((currentPlayer.neuralformingPoints / 80) * 100));
  const ethicsProgress = Math.min(100, Math.round((currentPlayer.ethicsPoints / 40) * 100));
  const techProgress = Math.min(100, Math.round((currentPlayer.techPoints / 50) * 100));
  const lawsProgress = Math.min(100, Math.round((currentPlayer.technologies.length / 5) * 100));
  const balance = Scoring.calculateBalance(currentPlayer);
  const balanceProgress = Math.min(100, Math.round(balance * 100));

  // Calcola progresso complessivo
  const overallProgress = Math.round(
    (neuralformingProgress * 0.35 + 
     ethicsProgress * 0.25 + 
     lawsProgress * 0.25 + 
     balanceProgress * 0.15)
  );

  return (
    <div className="space-y-1.5 h-full overflow-y-auto">
      {/* Header Dashboard - compatto */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-1.5 shadow-md text-white">
        <div className="flex items-center gap-1">
          <Landmark className="w-3 h-3" />
          <h2 className="text-xs font-bold">Dashboard</h2>
        </div>
      </div>

      {/* Emiciclo Parlamentare - compatto */}
      <div className="bg-white rounded-lg p-1.5 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Landmark className="w-3 h-3 text-gray-700" />
          <h3 className="text-[10px] font-bold text-gray-800">Parlamento</h3>
        </div>
        <ParliamentHemicycle 
          players={players}
          currentPlayerId={currentPlayerId}
        />
      </div>

      {/* Progresso Complessivo - compatto */}
      <div className="bg-white rounded-lg p-1.5 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[10px] font-bold text-gray-800">Progresso</h3>
          <span className="text-xs font-bold text-purple-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Metriche Principali - compatte */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Neuralforming */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-1.5 border border-purple-200">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-0.5">
              <Brain className="w-2.5 h-2.5 text-gray-700" />
              <span className="text-[10px] font-semibold text-gray-700">Neural</span>
            </div>
            <span className="text-xs font-bold text-purple-600">{currentPlayer.neuralformingPoints}/80</span>
          </div>
          <div className="w-full bg-purple-100 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${neuralformingProgress}%` }}
            />
          </div>
        </div>

        {/* Etica */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-1.5 border border-green-200">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-0.5">
              <Scale className="w-2.5 h-2.5 text-gray-700" />
              <span className="text-[10px] font-semibold text-gray-700">Etica</span>
            </div>
            <span className="text-xs font-bold text-green-600">{currentPlayer.ethicsPoints}/40</span>
          </div>
          <div className="w-full bg-green-100 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${ethicsProgress}%` }}
            />
          </div>
        </div>

        {/* Tecnologia */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-1.5 border border-blue-200">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-0.5">
              <Microscope className="w-2.5 h-2.5 text-gray-700" />
              <span className="text-[10px] font-semibold text-gray-700">Tech</span>
            </div>
            <span className="text-xs font-bold text-blue-600">{currentPlayer.techPoints}</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${techProgress}%` }}
            />
          </div>
        </div>

        {/* Bilanciamento */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-1.5 border border-orange-200">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-0.5">
              <Scale className="w-2.5 h-2.5 text-gray-700" />
              <span className="text-[10px] font-semibold text-gray-700">Bilancio</span>
            </div>
            <span className="text-xs font-bold text-orange-600">{Math.round(balance * 100)}%</span>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${balanceProgress}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
