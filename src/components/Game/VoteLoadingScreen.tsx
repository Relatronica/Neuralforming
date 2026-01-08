import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';

interface VoteLoadingScreenProps {
  onComplete: () => void;
  duration?: number; // Durata in millisecondi (default: 2500ms)
}

export const VoteLoadingScreen: React.FC<VoteLoadingScreenProps> = ({ 
  onComplete, 
  duration = 2500 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  
  const loadingTexts = [
    'Calcolo voti parlamentari...',
    'Analisi risultati...',
    'Verifica quorum...',
  ];

  useEffect(() => {
    // Aggiorna il progresso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.5; // Incrementa dell'1.5% ogni ~37ms (più lento)
      });
    }, duration / 67);

    // Cambia il testo ogni 600ms (più lento)
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length);
    }, 600);

    // Completa dopo la durata
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete, loadingTexts.length]);

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 border-2 border-gray-600 animate-fadeIn">
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        {/* Icona animata */}
        <div className="mb-6 relative">
          <div className="bg-gray-600 rounded-full p-6 shadow-lg">
            <Users className="w-12 h-12 text-white animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        </div>

        {/* Testo dinamico */}
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-6 text-center">
          {loadingTexts[currentText]}
        </h3>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Effetto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm text-gray-400 font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Indicatore di caricamento */}
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};
