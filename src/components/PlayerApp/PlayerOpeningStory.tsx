import { Sparkles, Check, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OpeningStory {
  id: string;
  title: string;
  content: string;
  mood: string;
}

interface PlayerOpeningStoryProps {
  story: OpeningStory;
  readyCount: number;
  totalPlayers: number;
  onReady: () => void;
}

const getMoodGradient = (mood: string) => {
  switch (mood) {
    case 'epic':
      return 'from-purple-600 to-blue-600';
    case 'urgent':
      return 'from-red-600 to-orange-600';
    case 'contemplative':
      return 'from-blue-600 to-indigo-600';
    case 'hopeful':
      return 'from-green-600 to-emerald-600';
    case 'philosophical':
      return 'from-indigo-600 to-purple-600';
    case 'mysterious':
      return 'from-gray-700 to-gray-900';
    case 'serious':
      return 'from-slate-700 to-slate-900';
    case 'inspiring':
      return 'from-cyan-600 to-blue-600';
    case 'strategic':
      return 'from-amber-600 to-yellow-600';
    case 'dramatic':
      return 'from-rose-600 to-pink-600';
    default:
      return 'from-gray-600 to-gray-800';
  }
};

export const PlayerOpeningStory = ({ story, readyCount, totalPlayers, onReady }: PlayerOpeningStoryProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleReady = () => {
    if (isReady) return;
    setIsReady(true);
    onReady();
  };

  const progress = totalPlayers > 0 ? (readyCount / totalPlayers) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 overflow-y-auto p-3">
      <div
        className={`bg-gradient-to-br ${getMoodGradient(story.mood)} rounded-xl shadow-2xl w-full max-w-lg border border-white/20 transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg leading-tight">
              {story.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 max-h-[45vh] overflow-y-auto">
            <p className="text-white/95 text-base leading-relaxed font-medium drop-shadow-sm">
              {story.content}
            </p>
          </div>

          {/* Readiness progress */}
          {totalPlayers > 0 && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/15">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/70 text-xs">Giocatori pronti</span>
                </div>
                <span className="text-white font-semibold text-sm">
                  {readyCount}/{totalPlayers}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ready button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleReady}
              disabled={isReady}
              className={`font-semibold py-3 px-8 rounded-lg transition-all duration-200 backdrop-blur-sm border shadow-lg flex items-center gap-2 ${
                isReady
                  ? 'bg-white/30 text-white border-white/40 cursor-default'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isReady ? (
                <>
                  <Check className="w-5 h-5" />
                  Pronto!
                </>
              ) : (
                'Sono Pronto'
              )}
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute top-8 left-8 w-24 h-24 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-8 right-8 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};
