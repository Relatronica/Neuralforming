import React, { useEffect, useState } from 'react';
import { 
  Landmark, 
  Check, 
  Shield, 
  Star, 
  Flame, 
  Zap, 
  Crown, 
  Globe, 
  Flashlight 
} from 'lucide-react';
import { getQueryParam } from '../../utils/deeplink';

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
  { name: 'Landmark', value: 'landmark', Icon: Landmark },
  { name: 'Scudo', value: 'shield', Icon: Shield },
  { name: 'Stella', value: 'star', Icon: Star },
  { name: 'Fiamma', value: 'flame', Icon: Flame },
  { name: 'Fulmine', value: 'lightning', Icon: Zap },
  { name: 'Corona', value: 'crown', Icon: Crown },
  { name: 'Globo', value: 'globe', Icon: Globe },
  { name: 'Torcia', value: 'torch', Icon: Flashlight },
];

export const PlayerLogin: React.FC<PlayerLoginProps> = ({ onLogin }) => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(availableColors[0].value);
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0].value);

  // Pre-compila l'ID stanza dai query param, se presente (?room=...)
  useEffect(() => {
    const qp = getQueryParam('room');
    if (qp) {
      setRoomId(qp);
      
      // Se c'è un roomId nel query param, pulisci eventuali credenziali vecchie
      // per permettere di entrare in una nuova partita senza conflitti
      try {
        const saved = localStorage.getItem('neuralforming_player_session');
        if (saved) {
          const session = JSON.parse(saved);
          if (session.roomId && session.roomId !== qp) {
            console.log('🔄 QR code roomId differs from saved session, will clear on login:', {
              savedRoomId: session.roomId,
              qrRoomId: qp,
            });
            // Non pulire subito, ma quando l'utente fa login verrà gestito
          }
        }
      } catch (e) {
        console.error('Failed to check session:', e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && playerName.trim()) {
      onLogin(roomId.trim(), playerName.trim(), selectedColor, selectedIcon);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Landmark className="w-8 h-8 text-gray-100" />
          <h1 className="text-2xl font-bold text-gray-100">Neuralforming</h1>
        </div>
        
        <p className="text-gray-300 text-center mb-6">
          Accedi alla partita con il tuo nome e l'ID della partita
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID Partita
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Incolla l'ID della partita"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono text-sm text-gray-100 placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome del Partito
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Il tuo nome partito"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-100 placeholder-gray-500"
              maxLength={30}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      ? 'border-gray-400 scale-110 shadow-lg' 
                      : 'border-gray-600 hover:border-gray-500 hover:scale-105'
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icona del Partito
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableIcons.map((iconOption) => {
                const IconComponent = iconOption.Icon;
                return (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => setSelectedIcon(iconOption.value)}
                    className={`
                      h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                      ${selectedIcon === iconOption.value 
                        ? 'border-gray-400 bg-gray-700 scale-110 shadow-lg' 
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700 hover:scale-105'
                      }
                    `}
                    title={iconOption.name}
                  >
                    <IconComponent className="w-6 h-6 text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Accedi alla Partita
          </button>
        </form>
      </div>
    </div>
  );
};

