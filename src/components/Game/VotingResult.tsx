import React from 'react';
import { VoteResult } from '../../game/types';
import { PlayerState } from '../../game/types';
import { CheckCircle2, XCircle, Users } from 'lucide-react';
import { getPartyColor } from '../../game/partyColors';

interface VotingResultProps {
  voteResult: VoteResult;
  players: PlayerState[];
  message?: string;
}

export const VotingResult: React.FC<VotingResultProps> = ({ 
  voteResult, 
  players,
  message 
}) => {
  const approvalRate = Math.round(voteResult.approvalRate * 100);
  const isApproved = approvalRate >= 50;
  
  // Trova i giocatori che hanno votato
  const supporters = players.filter(p => voteResult.supporters.includes(p.id));
  const opponents = players.filter(p => voteResult.opponents.includes(p.id));
  
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-blue-300">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Risultato Votazione Parlamentare
          </h3>
        </div>
        <div className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg transform transition-all duration-300 ${
          isApproved 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105' 
            : 'bg-gradient-to-r from-red-500 to-rose-500 text-white scale-105'
        }`}>
          {isApproved ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
          <span className="font-bold text-lg">{approvalRate}% Approvazione</span>
        </div>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-xl shadow-md border-2 ${
          approvalRate >= 70 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-900'
            : approvalRate >= 50
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-900'
            : approvalRate >= 30
            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 text-yellow-900'
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-900'
        }`}>
          <p className="text-base font-bold text-center">{message}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Sostenitori */}
        <div className="bg-white rounded-xl p-5 border-2 border-green-300 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 text-lg">
              A Favore
            </h4>
            <span className="ml-auto bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-sm">
              {voteResult.votesFor}
            </span>
          </div>
          <div className="space-y-2">
            {supporters.length > 0 ? (
              supporters.map(player => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: getPartyColor(player.id, player.color) }}
                  />
                  <span className="text-sm sm:text-base text-gray-800 font-semibold">
                    {player.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-2">Nessun sostenitore</p>
            )}
          </div>
        </div>
        
        {/* Oppositori */}
        <div className="bg-white rounded-xl p-5 border-2 border-red-300 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 rounded-full p-2">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 text-lg">
              Contro
            </h4>
            <span className="ml-auto bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full text-sm">
              {voteResult.votesAgainst}
            </span>
          </div>
          <div className="space-y-2">
            {opponents.length > 0 ? (
              opponents.map(player => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: getPartyColor(player.id, player.color) }}
                  />
                  <span className="text-sm sm:text-base text-gray-800 font-semibold">
                    {player.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-2">Nessun oppositore</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

