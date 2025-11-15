import React from 'react';
import { GlobalEventInfo } from '../../game/types';
import { AlertTriangle, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface GlobalEventCardProps {
  event: GlobalEventInfo;
  onDismiss: () => void;
}

export const GlobalEventCard: React.FC<GlobalEventCardProps> = ({ event, onDismiss }) => {
  // Determina lo stile in base al tipo di evento
  const getEventStyle = (eventId: string) => {
    if (eventId.includes('crisis')) {
      return {
        bg: 'bg-gray-800',
        border: 'border-gray-600',
        text: 'text-gray-200',
        icon: AlertTriangle,
        iconColor: 'text-gray-300',
      };
    } else if (eventId.includes('breakthrough') || eventId.includes('swing')) {
      return {
        bg: 'bg-gray-800',
        border: 'border-gray-600',
        text: 'text-gray-200',
        icon: TrendingUp,
        iconColor: 'text-gray-300',
      };
    } else {
      return {
        bg: 'bg-gray-800',
        border: 'border-gray-600',
        text: 'text-gray-200',
        icon: Users,
        iconColor: 'text-gray-300',
      };
    }
  };

  const style = getEventStyle(event.id);
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} border-2 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 max-w-3xl mx-auto transform hover:scale-[1.02] transition-transform duration-300`}>
      <div className="flex items-start gap-4 sm:gap-6">
        <div className={`${style.iconColor} flex-shrink-0 bg-gray-700 rounded-full p-3 sm:p-4 shadow-lg`}>
          <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className={`text-xl sm:text-2xl font-bold ${style.text} break-words flex-1`}>{event.title}</h3>
            <button
              onClick={onDismiss}
              className={`${style.text} hover:opacity-70 hover:bg-gray-700 rounded-full p-2 transition-all duration-200 text-lg sm:text-xl font-bold flex-shrink-0`}
            >
              ✕
            </button>
          </div>
          <p className={`${style.text} text-sm sm:text-base leading-relaxed mb-4 break-words`}>{event.description}</p>
          <div className={`mt-4 pt-4 border-t-2 ${style.border} bg-gray-700 bg-opacity-50 rounded-lg p-3`}>
            <p className={`${style.text} text-xs sm:text-sm font-semibold`}>
              ⚠️ Questo evento ha influenzato tutti i partiti. Controlla i tuoi punteggi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

