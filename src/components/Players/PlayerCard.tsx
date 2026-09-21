import React from 'react';
import { PlayerState } from '../../game/types';
import { Trophy, Microscope, Scale, Brain, Award, WifiOff, ScrollText } from 'lucide-react';
import { PartyIcon } from '../Brand/PartyIcon';
import { useGameCopy } from '../../lib/i18n/useGameCopy';

interface PlayerCardProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  isWinner?: boolean;
  isDisconnected?: boolean;
  turnOrder?: number;
}

function ScoreCell({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div className={`min-w-0 text-center ${className}`}>
      <Icon className="w-3 h-3 mx-auto mb-0.5 opacity-80" />
      <div className="text-sm font-heading font-bold tabular-nums leading-none">{value}</div>
      <div className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5 truncate">{label}</div>
    </div>
  );
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentPlayer,
  isWinner = false,
  isDisconnected = false,
  turnOrder,
}) => {
  const { t } = useGameCopy();
  const playerColor = player.color || '#6B7280';
  const laws = player.technologies.length;
  const milestones = player.unlockedMilestones?.length ?? 0;

  return (
    <div
      className={`
        relative rounded-lg px-2.5 py-2 border transition-colors duration-200
        ${isDisconnected ? 'opacity-60' : ''}
        ${isCurrentPlayer && !isDisconnected ? 'bg-cyber-800' : 'bg-cyber-800/50'}
      `}
      style={{
        borderColor: isDisconnected
          ? 'rgba(239, 68, 68, 0.5)'
          : isCurrentPlayer
            ? playerColor
            : 'rgba(255, 255, 255, 0.08)',
        boxShadow: isCurrentPlayer && !isDisconnected ? `inset 3px 0 0 ${playerColor}` : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {turnOrder != null && (
          <span className="w-4 shrink-0 text-center text-[10px] font-mono text-gray-500">
            {turnOrder}
          </span>
        )}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: isDisconnected ? '#4B5563' : playerColor }}
          title={player.name}
        >
          <PartyIcon icon={player.icon} isAI={player.isAI} className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-heading font-semibold truncate ${isDisconnected ? 'text-gray-400' : 'text-gray-100'}`}>
            {player.name}
          </h3>
          {isDisconnected && (
            <p className="text-[10px] text-red-300/80 flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              {t.roster.disconnected}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isWinner && (
            <span className="bg-amber-600 text-white p-1 rounded" title={t.game.victory}>
              <Trophy className="w-3 h-3" />
            </span>
          )}
          {isCurrentPlayer && !isDisconnected && (
            <span
              className="text-white text-[10px] font-heading font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ backgroundColor: playerColor }}
            >
              {t.roster.turn}
            </span>
          )}
          {isCurrentPlayer && isDisconnected && (
            <span className="bg-red-900/70 text-red-200 text-[10px] font-heading font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded">
              {t.roster.skip}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        <ScoreCell
          icon={Microscope}
          value={player.techPoints}
          label={t.scores.tech}
          className="text-tech-cyan"
        />
        <ScoreCell
          icon={Scale}
          value={player.ethicsPoints}
          label={t.scores.ethics}
          className="text-ethics-amber"
        />
        <ScoreCell
          icon={Brain}
          value={player.neuralformingPoints}
          label={t.scores.neural}
          className="text-neural-light"
        />
      </div>

      <div className="flex items-center gap-3 mt-2 pt-1.5 border-t border-white/5 text-[10px] text-gray-400">
        <span className="flex items-center gap-1" title={t.hand.laws}>
          <ScrollText className="w-3 h-3 text-tech-cyan/70" />
          <span className="tabular-nums text-gray-300">{laws}</span>
          <span>{t.hand.laws}</span>
        </span>
        {milestones > 0 && (
          <span className="flex items-center gap-1" title={t.hand.milestones}>
            <Award className="w-3 h-3 text-amber-400/70" />
            <span className="tabular-nums text-amber-200">{milestones}</span>
          </span>
        )}
      </div>
    </div>
  );
};
