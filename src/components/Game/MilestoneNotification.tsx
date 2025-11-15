import React from 'react';
import { MilestoneUnlocked } from '../../game/types';
import { milestones } from '../../game/Milestones';
import { PlayerState } from '../../game/types';
import { Trophy, Sparkles, X, User } from 'lucide-react';

interface MilestoneNotificationProps {
  unlocked: MilestoneUnlocked[];
  players: PlayerState[];
  onDismiss: () => void;
}

export const MilestoneNotification: React.FC<MilestoneNotificationProps> = ({ 
  unlocked, 
  players,
  onDismiss 
}) => {
  if (unlocked.length === 0) return null;

  // Raggruppa i milestone per giocatore
  const milestonesByPlayer = unlocked.reduce((acc, unlock) => {
    const player = players.find(p => p.id === unlock.playerId);
    if (!player) return acc;
    
    if (!acc[player.id]) {
      acc[player.id] = {
        player,
        milestones: [] as Array<typeof milestones[number]>
      };
    }
    
    const milestone = milestones.find(m => m.id === unlock.milestoneId);
    if (milestone) {
      acc[player.id].milestones.push(milestone);
    }
    
    return acc;
  }, {} as Record<string, { player: PlayerState; milestones: Array<typeof milestones[number]> }>);

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-2 border border-gray-600 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-gray-400" />
          <h2 className="text-xs font-bold text-gray-100">Milestone Raggiunti</h2>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-300 rounded p-0.5 transition-colors duration-200"
          title="Chiudi"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      
      <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
        {Object.values(milestonesByPlayer).map(({ player, milestones: playerMilestones }) => (
          <div key={player.id} className="bg-gray-700 rounded p-1.5 border border-gray-600">
            <div className="flex items-center gap-1 mb-1">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-200">{player.name}</span>
            </div>
            <div className="space-y-1">
              {playerMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="bg-gray-800 rounded p-1.5 border-l-2 border-gray-500"
                >
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="w-2.5 h-2.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[10px] font-bold text-gray-100 mb-0.5">
                        {milestone.name}
                      </h3>
                      <p className="text-[9px] text-gray-300 leading-tight">
                        <span className="font-semibold text-gray-200">{milestone.ability.name}:</span> {milestone.ability.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

