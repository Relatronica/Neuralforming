import React from 'react';
import { PlayerState } from '../../game/types';
import { PlayerCard } from './PlayerCard';
import { Users } from 'lucide-react';
import { useGameCopy } from '../../lib/i18n/useGameCopy';

interface PlayersListProps {
  players: PlayerState[];
  currentPlayerId: string;
  winnerId: string | null;
  disconnectedPlayerIds?: string[];
}

export const PlayersList: React.FC<PlayersListProps> = ({
  players,
  currentPlayerId,
  winnerId,
  disconnectedPlayerIds = [],
}) => {
  const { t } = useGameCopy();
  const humanPlayers = players.filter((p) => !p.isAI);
  const aiPlayers = players.filter((p) => p.isAI);
  const isMultiplayer = humanPlayers.length > 1;

  const renderCard = (player: PlayerState, order: number) => (
    <PlayerCard
      key={player.id}
      player={player}
      isCurrentPlayer={player.id === currentPlayerId}
      isWinner={player.id === winnerId}
      isDisconnected={disconnectedPlayerIds.includes(player.id)}
      turnOrder={order}
    />
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <Users className="w-4 h-4 text-tech-cyan" />
        <h3 className="text-sm font-heading font-bold text-gray-100">{t.roster.title}</h3>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-gray-500">
          {players.length} {t.roster.inGame}
        </span>
      </div>

      {isMultiplayer ? (
        <div className="space-y-1.5">
          {humanPlayers.map((player, index) => renderCard(player, index + 1))}
        </div>
      ) : (
        <>
          {humanPlayers.length > 0 && (
            <div className="mb-2">{renderCard(humanPlayers[0], 1)}</div>
          )}
          {aiPlayers.length > 0 && (
            <div>
              <p className="text-[10px] font-heading font-semibold uppercase tracking-wider text-gray-500 mb-1.5 px-0.5">
                {t.roster.aiOpponents}
              </p>
              <div className="space-y-1.5">
                {aiPlayers.map((player, index) =>
                  renderCard(player, humanPlayers.length + index + 1)
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
