import React from 'react';
import { Microscope, Scale, Brain } from 'lucide-react';
import { PlayerState } from '../../game/types';
import { Scoring } from '../../game/Scoring';
import { ScoreCard } from './ScoreCard';
import { useGameCopy } from '../../lib/i18n/useGameCopy';

interface DashboardProps {
  player: PlayerState;
  turn: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ player, turn }) => {
  const { t } = useGameCopy();
  const balance = Scoring.calculateBalance(player);
  const balancePercentage = Math.round(balance * 100);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">{t.dashboard.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ScoreCard
          label={t.dashboard.techPct}
          value={Math.round((player.techPoints / 50) * 100)}
          color="border-gray-600"
          icon={<Microscope className="w-8 h-8" />}
        />
        <ScoreCard
          label={t.dashboard.ethicsPct}
          value={Math.round((player.ethicsPoints / 45) * 100)}
          color="border-gray-600"
          icon={<Scale className="w-8 h-8" />}
        />
        <ScoreCard
          label={t.dashboard.neuralPct}
          value={Math.round((player.neuralformingPoints / 65) * 100)}
          color="border-gray-600"
          icon={<Brain className="w-8 h-8" />}
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">{t.dashboard.balanceLabel}</span>
          <span className="text-sm font-bold text-gray-100">{balancePercentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-gray-500 to-gray-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${balancePercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-300">{t.dashboard.turn}: <span className="font-bold text-gray-100">{turn}</span></p>
        <p className="text-xs text-gray-400 mt-2">
          {t.dashboard.winGoal}
        </p>
      </div>
    </div>
  );
};

