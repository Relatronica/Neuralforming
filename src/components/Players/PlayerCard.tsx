import React from 'react';
import { PlayerState } from '../../game/types';
import { Scoring } from '../../game/Scoring';
import { getPartyColor } from '../../game/partyColors';
import { milestones } from '../../game/Milestones';
import { Bot, User, Trophy, Microscope, Scale, Brain, Award } from 'lucide-react';

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
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isCurrentPlayer, isWinner = false }) => {
  const balance = Scoring.calculateBalance(player);
  const partyColor = getPartyColor(player.id, player.color);
  
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

  // Calcola il colore di sfondo con opacità
  const bgColor = `${partyColor}10`; // Opacità ridotta per un look più pulito
  const borderColor = isCurrentPlayer ? partyColor : `${partyColor}60`;

  return (
    <div
      className={`
        rounded-lg shadow-sm p-2 border-2 transition-all duration-200
        ${isCurrentPlayer ? 'ring-2 ring-offset-1 shadow-md' : ''}
        ${isWinner ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-400' : ''}
      `}
      style={{
        backgroundColor: isWinner ? undefined : bgColor,
        borderColor: isWinner ? undefined : borderColor,
        ringColor: isCurrentPlayer ? partyColor : undefined,
      }}
    >
      {/* Header: Nome e Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {player.isAI ? (
            <Bot className="w-3.5 h-3.5 text-gray-600" />
          ) : player.icon ? (
            <span className="text-base">{getIconEmoji(player.icon)}</span>
          ) : (
            <User className="w-3.5 h-3.5 text-gray-600" />
          )}
          <h3 className="font-semibold text-sm text-gray-800">{player.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          {isCurrentPlayer && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              TURNO
            </span>
          )}
          {isWinner && (
            <span className="bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Trophy className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Barre di Progresso con valori */}
      <div className="space-y-1.5 mb-2">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Microscope className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] text-gray-600">Tech</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600">{player.techPoints}/50</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (player.techPoints / 50) * 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-green-600" />
              <span className="text-[10px] text-gray-600">Etica</span>
            </div>
            <span className="text-[10px] font-bold text-green-600">{player.ethicsPoints}/45</span>
          </div>
          <div className="w-full bg-green-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (player.ethicsPoints / 45) * 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-600" />
              <span className="text-[10px] text-gray-600">Neural</span>
            </div>
            <span className="text-[10px] font-bold text-purple-600">{player.neuralformingPoints}</span>
          </div>
        </div>
      </div>

      {/* Info compatte: Tech, Milestone, Progresso */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
        <div className="flex items-center gap-1">
          <Microscope className="w-3 h-3" />
          <span>{player.technologies.length}/5</span>
        </div>
        {player.unlockedMilestones && player.unlockedMilestones.length > 0 && (
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3 text-yellow-600" />
            <span className="font-semibold text-yellow-700">{player.unlockedMilestones.length}</span>
          </div>
        )}
        {!player.isAI && (
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-purple-600" />
            <span className="font-semibold text-purple-600">{overallProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

