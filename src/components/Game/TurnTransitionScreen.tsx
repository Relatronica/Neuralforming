import React, { useState, useEffect } from 'react';
import { User, ArrowRight } from 'lucide-react';

interface TurnTransitionScreenProps {
  playerName: string;
  playerColor?: string;
  playerIcon?: string;
  onComplete: () => void;
  duration?: number; // Durata in millisecondi (default: 2000ms)
}

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

export const TurnTransitionScreen: React.FC<TurnTransitionScreenProps> = ({ 
  playerName,
  playerColor,
  playerIcon,
  onComplete,
  duration = 2000 
}) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Fade in immediato
    setFadeIn(true);

    // Inizia fade out negli ultimi 300ms
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 300);

    // Completa dopo la durata
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      } ${fadeIn ? 'scale-100' : 'scale-95'}`}
    >
      <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 border-2 border-gray-600 max-w-md w-full mx-4">
        <div className="flex flex-col items-center justify-center">
          {/* Icona freccia */}
          <div className="mb-6">
            <ArrowRight className="w-8 h-8 text-gray-400 animate-pulse" />
          </div>

          {/* Avatar giocatore */}
          <div className="mb-6 relative">
            <div
              className="w-20 h-20 rounded-full border-4 border-gray-600 shadow-xl flex items-center justify-center text-4xl transition-transform duration-300 hover:scale-110"
              style={{
                backgroundColor: playerColor || '#3B82F6',
                borderColor: playerColor ? `${playerColor}CC` : '#3B82F6CC',
              }}
            >
              {getIconEmoji(playerIcon)}
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-700 rounded-full px-3 py-1 border border-gray-600">
                <User className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>

          {/* Nome giocatore */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4 text-center">
            {playerName}
          </h2>

          {/* Testo */}
          <p className="text-lg text-gray-300 text-center mb-6">
            È il tuo turno
          </p>

          {/* Indicatore di caricamento */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
