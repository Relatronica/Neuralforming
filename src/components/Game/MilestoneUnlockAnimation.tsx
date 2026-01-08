import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

interface MilestoneUnlockAnimationProps {
  milestoneName: string;
  onComplete: () => void;
  duration?: number; // Durata in millisecondi (default: 1800ms)
}

export const MilestoneUnlockAnimation: React.FC<MilestoneUnlockAnimationProps> = ({ 
  milestoneName,
  onComplete,
  duration = 1800 
}) => {
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [sparkles, setSparkles] = useState(false);

  useEffect(() => {
    // Animazione di entrata
    const enterTimer = setTimeout(() => {
      setScale(1);
      setOpacity(1);
      setSparkles(true);
    }, 50);

    // Inizia fade out negli ultimi 300ms
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
      setScale(0.8);
    }, duration - 300);

    // Completa dopo la durata
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none"
      style={{
        opacity,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <div
        className="bg-gradient-to-br from-yellow-900/90 via-yellow-800/90 to-yellow-900/90 rounded-2xl shadow-2xl p-8 sm:p-12 border-4 border-yellow-500 max-w-md w-full mx-4 relative overflow-hidden"
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Effetto sparkle */}
        {sparkles && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"
                style={{
                  top: `${20 + (i % 4) * 20}%`,
                  left: `${20 + Math.floor(i / 4) * 60}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </>
        )}

        <div className="flex flex-col items-center justify-center relative z-10">
          {/* Icona trofeo */}
          <div className="mb-6 relative">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full p-6 shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            {sparkles && (
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
            )}
          </div>

          {/* Testo */}
          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-100 mb-3 text-center">
            Milestone Raggiunto!
          </h2>
          <p className="text-lg sm:text-xl text-yellow-200 text-center font-semibold">
            {milestoneName}
          </p>

          {/* Effetto glow */}
          <div className="mt-6 w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full animate-pulse" />
        </div>

        <style>{`
          @keyframes sparkle {
            0%, 100% {
              opacity: 0;
              transform: scale(0) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1) rotate(180deg);
            }
          }
          .animate-sparkle {
            animation: sparkle 1s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};
