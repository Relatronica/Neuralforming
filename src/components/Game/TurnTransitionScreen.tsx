import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { PartyIcon } from '../Brand/PartyIcon';
import { useGameCopy } from '../../lib/i18n/useGameCopy';

interface TurnTransitionScreenProps {
  playerName: string;
  playerColor?: string;
  playerIcon?: string;
  onComplete: () => void;
  duration?: number; // Durata in millisecondi (default: 2000ms)
}

export const TurnTransitionScreen: React.FC<TurnTransitionScreenProps> = ({ 
  playerName,
  playerColor,
  playerIcon,
  onComplete,
  duration = 2000 
}) => {
  const { t } = useGameCopy();
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
              className="w-20 h-20 rounded-2xl shadow-xl flex items-center justify-center"
              style={{
                backgroundColor: playerColor || '#3B82F6',
              }}
            >
              <PartyIcon icon={playerIcon} className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Nome giocatore */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4 text-center">
            {playerName}
          </h2>

          {/* Testo */}
          <p className="text-lg text-gray-300 text-center mb-6">
            {t.game.yourTurn}
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
