import React from 'react';
import { Users, Loader2 } from 'lucide-react';

interface PlayerWaitingProps {
  currentPlayerName: string;
}

export const PlayerWaiting: React.FC<PlayerWaitingProps> = ({
  currentPlayerName,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Turno di {currentPlayerName}
        </h2>
        <p className="text-gray-600 mb-4">
          Aspetta il tuo turno...
        </p>
        <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
      </div>
    </div>
  );
};

