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
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-800',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
      };
    } else if (eventId.includes('breakthrough') || eventId.includes('swing')) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-800',
        icon: TrendingUp,
        iconColor: 'text-green-600',
      };
    } else {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        icon: Users,
        iconColor: 'text-yellow-600',
      };
    }
  };

  const style = getEventStyle(event.id);
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} border-2 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 max-w-3xl mx-auto transform hover:scale-[1.02] transition-transform duration-300`}>
      <div className="flex items-start gap-4 sm:gap-6">
        <div className={`${style.iconColor} flex-shrink-0 bg-white rounded-full p-3 sm:p-4 shadow-lg`}>
          <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className={`text-xl sm:text-2xl font-bold ${style.text} break-words flex-1`}>{event.title}</h3>
            <button
              onClick={onDismiss}
              className={`${style.text} hover:opacity-70 hover:bg-white rounded-full p-2 transition-all duration-200 text-lg sm:text-xl font-bold flex-shrink-0`}
            >
              ✕
            </button>
          </div>
          <p className={`${style.text} text-sm sm:text-base leading-relaxed mb-4 break-words`}>{event.description}</p>
          <div className={`mt-4 pt-4 border-t-2 ${style.border} bg-white bg-opacity-50 rounded-lg p-3`}>
            <p className={`${style.text} text-xs sm:text-sm font-semibold`}>
              ⚠️ Questo evento ha influenzato tutti i partiti. Controlla i tuoi punteggi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

