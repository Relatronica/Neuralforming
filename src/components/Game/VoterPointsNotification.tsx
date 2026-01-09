import React, { useEffect } from 'react';
import { PlayerState } from '../../game/types';
import { Vote, X, TrendingUp, TrendingDown } from 'lucide-react';
import { getPartyColor } from '../../game/partyColors';

export interface VoterPointsInfo {
  playerId: string;
  vote: boolean; // true = SÌ, false = NO
  points: {
    techPoints: number;
    ethicsPoints: number;
    neuralformingPoints: number;
  };
  isApproved: boolean; // Se la legge è stata approvata o bocciata
}

interface VoterPointsNotificationProps {
  voterPoints: VoterPointsInfo[];
  players: PlayerState[];
  onDismiss: () => void;
  autoCloseDelay?: number; // Tempo in millisecondi per chiusura automatica (default: 5000ms)
}

export const VoterPointsNotification: React.FC<VoterPointsNotificationProps> = ({ 
  voterPoints, 
  players,
  onDismiss,
  autoCloseDelay = 5000 // 5 secondi di default
}) => {
  // Chiusura automatica dopo il delay
  useEffect(() => {
    if (voterPoints.length === 0) return;
    
    const timer = setTimeout(() => {
      onDismiss();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [voterPoints, autoCloseDelay, onDismiss]);

  if (voterPoints.length === 0) return null;

  // Raggruppa per giocatore
  const pointsByPlayer = voterPoints.reduce((acc, info) => {
    const player = players.find(p => p.id === info.playerId);
    if (!player) return acc;
    
    if (!acc[player.id]) {
      acc[player.id] = {
        player,
        info
      };
    }
    
    return acc;
  }, {} as Record<string, { player: PlayerState; info: VoterPointsInfo }>);

  const getTotalPoints = (points: VoterPointsInfo['points']) => {
    return points.techPoints + points.ethicsPoints + points.neuralformingPoints;
  };

  const isPositive = (points: VoterPointsInfo['points']) => {
    return getTotalPoints(points) > 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-gray-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-600 rounded-full p-2 shadow-lg">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-100">
              Punti da Votazione
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-100 transition-colors p-1.5 hover:bg-gray-700 rounded-lg"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {Object.values(pointsByPlayer).map(({ player, info }) => {
          const total = getTotalPoints(info.points);
          const positive = isPositive(info.points);
          const voteLabel = info.vote ? 'SÌ' : 'NO';
          const voteColor = info.vote 
            ? (info.isApproved ? 'text-green-400' : 'text-red-400')
            : (info.isApproved ? 'text-yellow-400' : 'text-red-400');
          
          return (
            <div 
              key={player.id}
              className={`bg-gray-800 rounded-lg p-4 border-2 ${
                positive 
                  ? 'border-green-600/50 bg-gradient-to-r from-green-900/20 to-transparent' 
                  : 'border-red-600/50 bg-gradient-to-r from-red-900/20 to-transparent'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-700 shadow-md flex-shrink-0"
                  style={{ backgroundColor: getPartyColor(player.id, player.color) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-gray-100">
                      {player.name}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${voteColor} bg-gray-700/50`}>
                      Voto: {voteLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {info.isApproved 
                      ? (info.vote 
                          ? 'Hai sostenuto una legge popolare' 
                          : 'Hai sbagliato previsione, ma la legge è passata')
                      : (info.vote 
                          ? 'Hai sostenuto una legge impopolare' 
                          : 'Hai bloccato il progresso')}
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold ${
                  positive 
                    ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                    : 'bg-red-900/50 text-red-300 border border-red-700/50'
                }`}>
                  {positive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {total > 0 ? '+' : ''}{total}
                  </span>
                </div>
              </div>
              
              {/* Dettagli punti */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-700">
                {info.points.techPoints !== 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Tech</p>
                    <p className={`text-sm font-bold ${
                      info.points.techPoints > 0 ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      {info.points.techPoints > 0 ? '+' : ''}{info.points.techPoints}
                    </p>
                  </div>
                )}
                {info.points.ethicsPoints !== 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Etica</p>
                    <p className={`text-sm font-bold ${
                      info.points.ethicsPoints > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {info.points.ethicsPoints > 0 ? '+' : ''}{info.points.ethicsPoints}
                    </p>
                  </div>
                )}
                {info.points.neuralformingPoints !== 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Neural</p>
                    <p className={`text-sm font-bold ${
                      info.points.neuralformingPoints > 0 ? 'text-purple-400' : 'text-red-400'
                    }`}>
                      {info.points.neuralformingPoints > 0 ? '+' : ''}{info.points.neuralformingPoints}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
