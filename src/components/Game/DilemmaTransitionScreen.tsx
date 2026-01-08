import React, { useState, useEffect } from 'react';
import { Scale, Loader2 } from 'lucide-react';

interface DilemmaTransitionScreenProps {
  onComplete: () => void;
  duration?: number; // Durata in millisecondi (default: 2000ms)
}

export const DilemmaTransitionScreen: React.FC<DilemmaTransitionScreenProps> = ({ 
  onComplete, 
  duration = 2000 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
  const loadingTexts = [
    'Valutazione conseguenze...',
    'Analisi impatto decisione...',
    'Calcolo effetti etici...',
  ];

  useEffect(() => {
    // Aggiorna il progresso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.8; // Incrementa dell'1.8% ogni ~36ms (più lento)
      });
    }, duration / 55);

    // Cambia il testo ogni 500ms (più lento)
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length);
    }, 500);

    // Inizia fade out negli ultimi 200ms
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 200);

    // Completa dopo la durata
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete, loadingTexts.length]);

  return (
    <div 
      className={`bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border-2 border-gray-600 transition-opacity duration-200 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        {/* Icona bilancia animata */}
        <div className="mb-6 relative">
          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-full p-5 shadow-lg">
            <Scale className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
          </div>
        </div>

        {/* Testo dinamico */}
        <h3 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6 text-center">
          {loadingTexts[currentText]}
        </h3>

        {/* Progress bar con colore verde (etica) */}
        <div className="w-full max-w-md">
          <div className="bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-green-500 via-green-400 to-green-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Effetto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Indicatore di caricamento */}
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.7s',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.2s infinite;
        }
      `}</style>
    </div>
  );
};
