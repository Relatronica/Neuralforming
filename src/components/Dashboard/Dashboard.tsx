import React from 'react';
import { PlayerState } from '../../game/types';
import { Scoring } from '../../game/Scoring';
import { ScoreCard } from './ScoreCard';

interface DashboardProps {
  player: PlayerState;
  turn: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ player, turn }) => {
  const balance = Scoring.calculateBalance(player);
  const balancePercentage = Math.round(balance * 100);

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard IA</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ScoreCard
          label="Punti Tecnologia"
          value={player.techPoints}
          color="border-blue-500"
          icon="🔬"
        />
        <ScoreCard
          label="Punti Etica"
          value={player.ethicsPoints}
          color="border-green-500"
          icon="⚖️"
        />
        <ScoreCard
          label="Neuralforming"
          value={player.neuralformingPoints}
          color="border-purple-500"
          icon="🧠"
        />
      </div>

      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Bilanciamento Etica/Tecnologia</span>
          <span className="text-sm font-bold text-gray-900">{balancePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${balancePercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Turno: <span className="font-bold text-gray-900">{turn}</span></p>
        <p className="text-xs text-gray-500 mt-2">
          Obiettivo: 65+ Neuralforming, 45+ Etica, 5+ Tecnologie, Bilanciamento ≥0.5
        </p>
      </div>
    </div>
  );
};

