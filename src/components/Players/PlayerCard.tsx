import React from 'react';
import { PlayerState } from '../../game/types';
import { Scoring } from '../../game/Scoring';
import { Bot, User, Trophy, Microscope, Scale, Brain, Award, WifiOff } from 'lucide-react';

// Mappa icone a emoji
const iconEmojiMap: Record<string, string> = {
  landmark: '🏛️',
  shield: '🛡️',
  star: '⭐',
  flame: '🔥',
  lightning: '⚡',
  crown: '👑',
  globe: '🌍',
  torch: '🔦',
};

const getIconEmoji = (icon: string): string => {
  return iconEmojiMap[icon] || '👤';
};

interface PlayerCardProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  isWinner?: boolean;
  isDisconnected?: boolean;
  turnOrder?: number; // 1-based turn order position
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isCurrentPlayer, isWinner = false, isDisconnected = false, turnOrder }) => {
  const balance = Scoring.calculateBalance(player);
  
  // Calcola il progresso verso la vittoria
  const neuralformingProgress = Math.min(100, Math.round((player.neuralformingPoints / 65) * 100));
  const ethicsProgress = Math.min(100, Math.round((player.ethicsPoints / 45) * 100));
  const techProgress = Math.min(100, Math.round((player.technologies.length / 5) * 100));
  const balanceProgress = balance >= 0.5 ? 100 : Math.min(100, Math.round((balance / 0.5) * 100));
  
  // Progresso complessivo (media pesata)
  const overallProgress = Math.round(
    (neuralformingProgress * 0.35 + 
     ethicsProgress * 0.25 + 
     techProgress * 0.25 + 
     balanceProgress * 0.15)
  );

  // Colore del giocatore (per accento visivo)
  const playerColor = player.color || '#6B7280';

  return (
    <div
      className={`
        rounded-lg shadow-sm p-2 transition-all duration-200 bg-gray-800 border-l-4 border border-gray-700
        ${isCurrentPlayer ? 'ring-2 ring-offset-1 ring-offset-gray-900 shadow-lg' : ''}
        ${isWinner ? 'bg-gradient-to-br from-amber-900/20 to-gray-800' : ''}
        ${isDisconnected ? 'opacity-50' : ''}
      `}
      style={{
        borderLeftColor: isDisconnected ? 'rgb(239, 68, 68)' : playerColor,
        borderRightColor: isDisconnected ? 'rgb(239, 68, 68)' : isCurrentPlayer ? playerColor : 'rgb(55, 65, 81)',
        borderTopColor: isDisconnected ? 'rgb(239, 68, 68)' : isCurrentPlayer ? playerColor : 'rgb(55, 65, 81)',
        borderBottomColor: isDisconnected ? 'rgb(239, 68, 68)' : isCurrentPlayer ? playerColor : 'rgb(55, 65, 81)',
        // Ring color set via Tailwind's ring utility + inline --tw-ring-color
        ['--tw-ring-color' as string]: isCurrentPlayer ? playerColor : undefined,
      }}
    >
      {/* Header: Nome e Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {turnOrder && (
            <span className="text-xs font-bold text-gray-500 w-4 text-center">{turnOrder}</span>
          )}
          {player.isAI ? (
            <Bot className="w-3.5 h-3.5 text-gray-400" />
          ) : player.icon ? (
            <span className="text-base">{getIconEmoji(player.icon)}</span>
          ) : (
            <User className="w-3.5 h-3.5 text-gray-400" />
          )}
          <h3 className={`font-semibold text-sm ${isDisconnected ? 'text-gray-400' : 'text-gray-100'}`}>{player.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          {isDisconnected && (
            <span className="bg-red-900/60 text-red-300 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Giocatore disconnesso">
              <WifiOff className="w-2.5 h-2.5" />
            </span>
          )}
          {isCurrentPlayer && !isDisconnected && (
            <span 
              className="text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse"
              style={{ backgroundColor: playerColor }}
            >
              TURNO
            </span>
          )}
          {isCurrentPlayer && isDisconnected && (
            <span className="bg-red-900/60 text-red-300 text-xs font-bold px-1.5 py-0.5 rounded animate-pulse">
              SKIP...
            </span>
          )}
          {isWinner && (
            <span className="bg-amber-600 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Trophy className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Barre di Progresso - con colori semantici e numeri sempre visibili */}
      <div className="space-y-1.5 mb-2">
        {/* Tech - Blu */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Microscope className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-300/80">Tech</span>
            </div>
            <span className="text-xs font-bold text-blue-300">
              {player.techPoints}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (player.techPoints / 50) * 100)}%` }}
            />
          </div>
        </div>
        {/* Etica - Verde */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-300/80">Etica</span>
            </div>
            <span className="text-xs font-bold text-emerald-300">
              {player.ethicsPoints}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (player.ethicsPoints / 45) * 100)}%` }}
            />
          </div>
        </div>
        {/* Neural - Viola */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-300/80">Neural</span>
            </div>
            <span className="text-xs font-bold text-purple-300">
              {player.neuralformingPoints}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (player.neuralformingPoints / 65) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info compatte: sempre visibili */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1" title={`Tecnologie: ${player.technologies.length}/5`}>
          <Microscope className="w-3 h-3 text-blue-400/60" />
          <span className="text-gray-300">{player.technologies.length}/5</span>
        </div>
        {player.unlockedMilestones && player.unlockedMilestones.length > 0 && (
          <div className="flex items-center gap-1" title={`Milestone: ${player.unlockedMilestones.length}`}>
            <Award className="w-3 h-3 text-amber-400/60" />
            <span className="font-semibold text-amber-300">{player.unlockedMilestones.length}</span>
          </div>
        )}
        {!player.isAI && (
          <div className="flex items-center gap-1" title={`Progresso: ${overallProgress}%`}>
            <Trophy className="w-3 h-3 text-amber-400/60" />
            <span className="font-semibold text-gray-300">{overallProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

