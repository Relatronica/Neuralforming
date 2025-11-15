import React, { useEffect, useState, useMemo } from 'react';
import { PlayerState } from '../../game/types';

interface BoardGridProps {
  players: PlayerState[];
  currentPlayerId: string;
}

interface CellPosition {
  row: number;
  col: number;
}

/**
 * Crea un percorso a serpentina per la griglia (come il gioco dell'oca)
 * Il percorso va da sinistra a destra, poi torna indietro nella riga successiva
 */
const createSnakePath = (gridSize: number): CellPosition[] => {
  const path: CellPosition[] = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    const row = Math.floor(i / gridSize);
    // Nelle righe pari (0, 2, 4...) va da sinistra a destra
    // Nelle righe dispari (1, 3, 5...) va da destra a sinistra
    const col = row % 2 === 0 
      ? i % gridSize 
      : gridSize - 1 - (i % gridSize);
    path.push({ row, col });
  }
  return path;
};

export const BoardGrid: React.FC<BoardGridProps> = ({ players, currentPlayerId }) => {
  const gridSize = 8; // 8x8 = 64 celle
  const [playerPositions, setPlayerPositions] = useState<Map<string, CellPosition>>(new Map());
  const snakePath = useMemo(() => createSnakePath(gridSize), [gridSize]);

  // Calcola le posizioni dei giocatori con animazione
  useEffect(() => {
    const positions = new Map<string, CellPosition>();
    players.forEach(player => {
      // Usa il punteggio Neuralforming per determinare la posizione
      // Scala da 0 a 60 punti Neuralforming su tutte le celle
      const maxPoints = 60;
      const normalizedScore = Math.min(player.neuralformingPoints, maxPoints);
      const cellIndex = Math.min(
        Math.floor((normalizedScore / maxPoints) * (gridSize * gridSize - 1)),
        gridSize * gridSize - 1
      );
      positions.set(player.id, snakePath[cellIndex]);
    });
    
    // Piccolo delay per animazione fluida
    const timer = setTimeout(() => {
      setPlayerPositions(positions);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [players, snakePath]);

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

  const getIconEmoji = (icon?: string): string => {
    if (!icon) return '👤';
    return iconEmojiMap[icon] || '👤';
  };

  // Colori per i giocatori - usa il colore personalizzato se disponibile
  const getPlayerColorClass = (player: PlayerState): string => {
    if (player.color) {
      // Usa il colore personalizzato con opacità per il background
      return '';
    }
    // Fallback ai colori predefiniti
    if (player.id === 'player-human') {
      return 'bg-blue-500 border-blue-700';
    }
    const aiColors = [
      'bg-red-500 border-red-700',
      'bg-green-500 border-green-700',
      'bg-yellow-500 border-yellow-700',
      'bg-purple-500 border-purple-700',
    ];
    const aiIndex = parseInt(player.id.split('-').pop() || '0') || 0;
    return aiColors[aiIndex % aiColors.length];
  };

  // Icone per i giocatori
  const getPlayerIcon = (player: PlayerState) => {
    if (player.isAI) return '🤖';
    if (player.icon) return getIconEmoji(player.icon);
    return '👤';
  };

  // Trova tutti i giocatori in una cella
  const getPlayersInCell = (row: number, col: number): PlayerState[] => {
    return players.filter(player => {
      const pos = playerPositions.get(player.id);
      return pos && pos.row === row && pos.col === col;
    });
  };

  // Celle speciali (aree del laboratorio)
  const getCellType = (row: number, col: number): 'start' | 'lab' | 'ethics' | 'test' | 'social' | 'finish' | 'normal' => {
    const index = row * gridSize + col;
    if (index === 0) return 'start';
    if (index === gridSize * gridSize - 1) return 'finish';
    
    // Aree speciali distribuite lungo il percorso
    if (index === 8 || index === 16) return 'lab';
    if (index === 24 || index === 32) return 'ethics';
    if (index === 40 || index === 48) return 'test';
    if (index === 56) return 'social';
    
    return 'normal';
  };

  const getCellIcon = (type: string): string => {
    switch (type) {
      case 'start': return '🚀';
      case 'finish': return '🏆';
      case 'lab': return '💻';
      case 'ethics': return '⚖️';
      case 'test': return '🧪';
      case 'social': return '🌐';
      default: return '';
    }
  };

  const getCellColor = (type: string): string => {
    switch (type) {
      case 'start': return 'bg-green-100 border-green-300';
      case 'finish': return 'bg-yellow-100 border-yellow-300';
      case 'lab': return 'bg-blue-50 border-blue-200';
      case 'ethics': return 'bg-green-50 border-green-200';
      case 'test': return 'bg-purple-50 border-purple-200';
      case 'social': return 'bg-orange-50 border-orange-200';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 shadow-lg">
      <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">Parlamento</h2>
      
      <div className="bg-white rounded-lg p-2 shadow-inner overflow-x-auto">
        <div 
          className="grid gap-0.5 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: '500px',
            minWidth: '250px'
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const cellType = getCellType(row, col);
            const playersInCell = getPlayersInCell(row, col);
            const isCurrentPlayerCell = playersInCell.some(p => p.id === currentPlayerId);

            return (
              <div
                key={index}
                className={`
                  aspect-square border-2 rounded-lg relative transition-all duration-300
                  ${getCellColor(cellType)}
                  ${isCurrentPlayerCell ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  ${playersInCell.length > 0 ? 'shadow-md' : ''}
                `}
                style={{ minHeight: '32px', minWidth: '32px' }}
              >
                {/* Icona della cella speciale */}
                {cellType !== 'normal' && (
                  <div className="absolute top-0 left-0 text-xs p-1">
                    {getCellIcon(cellType)}
                  </div>
                )}

                {/* Numero della cella (opzionale, per debug) */}
                {import.meta.env.DEV && (
                  <div className="absolute bottom-0 right-0 text-[8px] text-gray-400 p-1">
                    {index}
                  </div>
                )}

                {/* Giocatori nella cella */}
                <div className="flex flex-wrap items-center justify-center h-full gap-1 p-1">
                  {playersInCell.map((player, idx) => (
                    <div
                      key={player.id}
                      className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${player.color ? '' : getPlayerColorClass(player)}
                        ${player.id === currentPlayerId ? 'ring-2 ring-blue-400 animate-pulse' : ''}
                        transition-all duration-500 ease-in-out
                        transform hover:scale-110
                      `}
                      style={{
                        backgroundColor: player.color || undefined,
                        borderColor: player.color ? `${player.color}CC` : undefined,
                        animationDelay: `${idx * 100}ms`,
                        zIndex: player.id === currentPlayerId ? 10 : 5,
                      }}
                      title={`${player.name}: ${player.neuralformingPoints} Neuralforming`}
                    >
                      <span className="text-xs">{getPlayerIcon(player)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-2 bg-white rounded-lg p-2 shadow-md">
        <h3 className="text-xs font-semibold text-gray-700 mb-1">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[10px]">
          <div className="flex items-center gap-2">
            <span>🚀</span>
            <span className="text-gray-600">Partenza</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💻</span>
            <span className="text-gray-600">Lab Programmazione</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚖️</span>
            <span className="text-gray-600">Area Etica</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🧪</span>
            <span className="text-gray-600">Scenari Test</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <span className="text-gray-600">Etica Sociale</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏆</span>
            <span className="text-gray-600">Vittoria</span>
          </div>
        </div>
      </div>

      {/* Info giocatori */}
      <div className="mt-2 bg-white rounded-lg p-2 shadow-md">
        <h3 className="text-xs font-semibold text-gray-700 mb-1">Posizioni Giocatori</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[10px]">
          {players.map((player) => {
            const pos = playerPositions.get(player.id);
            const cellIndex = pos ? pos.row * gridSize + pos.col : 0;
            return (
              <div key={player.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`
                    w-4 h-4 rounded-full border-2 ${playerColors[player.id] || 'bg-gray-500'}
                  `} />
                  <span className="text-gray-700">{player.name}:</span>
                </div>
                <span className="text-gray-600 font-semibold">
                  {player.neuralformingPoints} Neuralforming (Cella {cellIndex})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

