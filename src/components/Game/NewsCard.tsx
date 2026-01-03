import React, { useEffect, useState } from 'react';
import { SocietyNews } from '../../game/types';
import { Newspaper, TrendingUp, AlertTriangle, Sparkles, Zap } from 'lucide-react';

interface NewsCardProps {
  news: SocietyNews;
  onDismiss: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          onDismiss();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);
  // Determina lo stile in base alla categoria
  const getNewsStyle = (category: string) => {
    switch (category) {
      case 'tech':
        return {
          bg: 'bg-gray-800',
          border: 'border-blue-600',
          text: 'text-gray-200',
          icon: Zap,
          iconColor: 'text-blue-400',
          title: 'Notizie Tecnologiche',
        };
      case 'ethics':
        return {
          bg: 'bg-gray-800',
          border: 'border-green-600',
          text: 'text-gray-200',
          icon: Sparkles,
          iconColor: 'text-green-400',
          title: 'Notizie Etiche',
        };
      case 'breakthrough':
        return {
          bg: 'bg-gray-800',
          border: 'border-purple-600',
          text: 'text-gray-200',
          icon: TrendingUp,
          iconColor: 'text-purple-400',
          title: 'Breakthrough',
        };
      case 'crisis':
        return {
          bg: 'bg-gray-800',
          border: 'border-red-600',
          text: 'text-gray-200',
          icon: AlertTriangle,
          iconColor: 'text-red-400',
          title: 'Crisi',
        };
      default:
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-600',
          text: 'text-gray-200',
          icon: Newspaper,
          iconColor: 'text-gray-400',
          title: 'Notizie',
        };
    }
  };

  const style = getNewsStyle(news.category);
  const Icon = style.icon;

  // Calcola gli effetti della news
  const effects = [];
  if (news.effect.techPoints) {
    effects.push({
      type: 'Tech',
      value: news.effect.techPoints,
      isPositive: news.effect.techPoints > 0,
    });
  }
  if (news.effect.ethicsPoints) {
    effects.push({
      type: 'Etica',
      value: news.effect.ethicsPoints,
      isPositive: news.effect.ethicsPoints > 0,
    });
  }
  if (news.effect.neuralformingPoints) {
    effects.push({
      type: 'Neural',
      value: news.effect.neuralformingPoints,
      isPositive: news.effect.neuralformingPoints > 0,
    });
  }

  return (
    <div className={`${style.bg} ${style.border} border-2 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 max-w-3xl mx-auto transform hover:scale-[1.02] transition-transform duration-300`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`${style.iconColor} flex-shrink-0 bg-gray-700 rounded-full p-2 sm:p-3 shadow-lg`}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1">
              <p className={`text-xs sm:text-sm ${style.iconColor} font-semibold mb-1`}>
                {style.title}
              </p>
              <h3 className={`text-lg sm:text-xl font-bold ${style.text} break-words`}>
                {news.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`text-xs ${style.text} opacity-70 bg-gray-700 px-2 py-1 rounded-full`}>
                {timeLeft}s
              </div>
              <button
                onClick={onDismiss}
                className={`${style.text} hover:opacity-70 hover:bg-gray-700 rounded-full p-1 sm:p-2 transition-all duration-200 text-base sm:text-lg font-bold`}
              >
                ✕
              </button>
            </div>
          </div>
          <p className={`${style.text} text-sm sm:text-base leading-relaxed mb-3 break-words`}>
            {news.description}
          </p>
          {effects.length > 0 && (
            <div className={`mt-3 pt-3 border-t-2 ${style.border} bg-gray-700 bg-opacity-30 rounded-lg p-2 sm:p-3`}>
              <p className={`${style.text} text-xs sm:text-sm font-semibold mb-1`}>
                Effetti sulla società:
              </p>
              <div className="flex flex-wrap gap-2">
                {effects.map((effect, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs sm:text-sm font-semibold ${
                      effect.isPositive
                        ? 'bg-green-900/50 text-green-300 border border-green-700'
                        : 'bg-red-900/50 text-red-300 border border-red-700'
                    }`}
                  >
                    {effect.isPositive ? '+' : ''}{effect.value} {effect.type}
                  </span>
                ))}
              </div>
              <p className={`${style.text} text-xs mt-2`}>
                {news.targets === 'all' 
                  ? 'Questo evento ha influenzato tutti i partiti.' 
                  : news.targets === 'current'
                  ? 'Questo evento ha influenzato solo il giocatore corrente.'
                  : 'Questo evento ha influenzato gli altri partiti.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

