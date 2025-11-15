import React from 'react';
import { Users, Loader2 } from 'lucide-react';

interface PlayerWaitingProps {
  currentPlayerName: string;
}

export const PlayerWaiting: React.FC<PlayerWaitingProps> = ({
  currentPlayerName,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-700">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-100 mb-2">
          Turno di {currentPlayerName}
        </h2>
        <p className="text-gray-300 mb-4">
          Aspetta il tuo turno...
        </p>
        <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
      </div>
    </div>
  );
};

