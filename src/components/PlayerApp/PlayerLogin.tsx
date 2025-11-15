import React, { useState } from 'react';
import { Landmark, Check } from 'lucide-react';

interface PlayerLoginProps {
  onLogin: (roomId: string, playerName: string, playerColor: string, playerIcon: string) => void;
}

// Colori disponibili per i partiti
const availableColors = [
  { name: 'Blu', value: '#3b82f6' },
  { name: 'Rosso', value: '#ef4444' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Giallo', value: '#eab308' },
  { name: 'Viola', value: '#a855f7' },
  { name: 'Arancione', value: '#f97316' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Ciano', value: '#06b6d4' },
];

// Icone disponibili per i partiti
const availableIcons = [
  { name: 'Landmark', icon: '🏛️', value: 'landmark' },
  { name: 'Scudo', icon: '🛡️', value: 'shield' },
  { name: 'Stella', icon: '⭐', value: 'star' },
  { name: 'Fiamma', icon: '🔥', value: 'flame' },
  { name: 'Fulmine', icon: '⚡', value: 'lightning' },
  { name: 'Corona', icon: '👑', value: 'crown' },
  { name: 'Globo', icon: '🌍', value: 'globe' },
  { name: 'Torcia', icon: '🔦', value: 'torch' },
];

export const PlayerLogin: React.FC<PlayerLoginProps> = ({ onLogin }) => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(availableColors[0].value);
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && playerName.trim()) {
      onLogin(roomId.trim(), playerName.trim(), selectedColor, selectedIcon);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Landmark className="w-8 h-8 text-gray-800" />
          <h1 className="text-2xl font-bold text-gray-800">Neuralforming</h1>
        </div>
        
        <p className="text-gray-600 text-center mb-6">
          Accedi alla partita con il tuo nome e l'ID della partita
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Partita
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Incolla l'ID della partita"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome del Partito
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Il tuo nome partito"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={30}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colore del Partito
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    relative h-12 rounded-lg border-2 transition-all duration-200
                    ${selectedColor === color.value 
                      ? 'border-gray-800 scale-110 shadow-lg' 
                      : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icona del Partito
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableIcons.map((iconOption) => (
                <button
                  key={iconOption.value}
                  type="button"
                  onClick={() => setSelectedIcon(iconOption.value)}
                  className={`
                    h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-2xl
                    ${selectedIcon === iconOption.value 
                      ? 'border-gray-800 bg-gray-100 scale-110 shadow-lg' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 hover:scale-105'
                    }
                  `}
                  title={iconOption.name}
                >
                  {iconOption.icon}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Accedi alla Partita
          </button>
        </form>
      </div>
    </div>
  );
};

