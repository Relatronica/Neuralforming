import { X, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import openingStoriesData from '../../data/openingStories.json';

interface OpeningStory {
  id: string;
  title: string;
  content: string;
  mood: string;
}

interface OpeningStoryModalProps {
  onClose: () => void;
  story?: OpeningStory | null;
  readyCount?: number;
  totalPlayers?: number;
  onStorySelected?: (story: OpeningStory) => void;
}

export const OpeningStoryModal = ({ onClose, story: externalStory, readyCount = 0, totalPlayers = 0, onStorySelected }: OpeningStoryModalProps) => {
  const [story, setStory] = useState<OpeningStory | null>(externalStory || null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!externalStory) {
      const stories = openingStoriesData as OpeningStory[];
      const randomStory = stories[Math.floor(Math.random() * stories.length)];
      setStory(randomStory);
      onStorySelected?.(randomStory);
    }
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  if (!story) return null;

  const getMoodColor = (mood: string) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        className={`bg-gradient-to-br ${getMoodColor(story.mood)} rounded-xl shadow-2xl max-w-3xl w-full border border-white/20 transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header con decorazione */}
        <div className="relative p-8 pb-6">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg backdrop-blur-sm"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              {story.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <p className="text-white/95 text-lg leading-relaxed font-medium drop-shadow-sm">
              {story.content}
            </p>
          </div>

          {/* Readiness progress (multiplayer) */}
          {totalPlayers > 0 && (
            <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/15">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/70" />
                  <span className="text-white/80 text-sm">Giocatori pronti</span>
                </div>
                <span className="text-white font-bold text-lg">
                  {readyCount}/{totalPlayers}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalPlayers > 0 ? (readyCount / totalPlayers) * 100 : 0}%` }}
                />
              </div>
              {readyCount >= totalPlayers && totalPlayers > 0 && (
                <p className="text-white/90 text-sm text-center mt-2 font-medium">
                  Tutti pronti!
                </p>
              )}
            </div>
          )}

          {/* Call to action */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30 hover:scale-105 shadow-lg"
            >
              Inizia il Gioco
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};
