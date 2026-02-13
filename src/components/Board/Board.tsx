import React, { useState } from 'react';
import { Technology, PlayerState, VoteResult } from '../../game/types';
import { ParliamentHemicycle } from './ParliamentHemicycle';
import { Landmark, QrCode, X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildPlayerJoinUrl } from '../../utils/deeplink';

interface BoardProps {
  technologies: Technology[];
  players: PlayerState[];
  currentPlayerId: string;
  voteResult?: VoteResult | null;
  isVoting?: boolean;
  roomId?: string | null;
}

export const Board: React.FC<BoardProps> = ({ players, currentPlayerId, voteResult = null, isVoting = false, roomId = null }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  if (!currentPlayer) return null;

  // Mostra l'immagine quando c'è una votazione in corso o un risultato di votazione
  const showImage = isVoting || voteResult !== null;

  const joinUrl = roomId ? buildPlayerJoinUrl(roomId) : '';

  const copyJoinUrl = () => {
    if (joinUrl) {
      navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-1.5 h-full overflow-y-auto">
      {/* Logo o Immagine Home */}
      <div className="bg-gray-800 rounded-lg p-1.5 shadow-sm border border-gray-700 relative">
        {showImage ? (
          <img 
            src="/images/home.jpg" 
            alt="Home" 
            className="w-full h-auto rounded-lg object-cover"
          />
        ) : (
          <img 
            src="/images/logo/logo_neuralforming.png" 
            alt="Neuralforming Logo" 
            className="w-full h-50 mx-auto rounded-lg object-contain"
          />
        )}

        {/* Pulsante QR Code per invitare giocatori */}
        {roomId && (
          <button
            onClick={() => setShowQRModal(true)}
            className="absolute top-2.5 right-2.5 bg-gray-700/80 hover:bg-gray-600 text-gray-200 hover:text-white p-1.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm border border-gray-600/50"
            title="Mostra QR Code per invitare giocatori"
          >
            <QrCode className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Emiciclo Parlamentare - compatto */}
      <div className="bg-gray-800 rounded-lg p-1.5 shadow-sm border border-gray-700">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Landmark className="w-4 h-4 text-gray-300" />
          <h3 className="text-sm font-bold text-gray-100">Parlamento</h3>
        </div>
        <ParliamentHemicycle
          players={players}
          currentPlayerId={currentPlayerId}
          mode={voteResult ? 'vote' : undefined}
          voteResult={voteResult || undefined}
        />
      </div>

      {/* Modale QR Code */}
      {showQRModal && roomId && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowQRModal(false)}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsante chiudi */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Titolo */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <QrCode className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-gray-100">Invita Giocatori</h3>
              </div>
              <p className="text-xs text-gray-400">
                Inquadra il QR code per unirti alla partita in corso
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-lg p-3">
                <QRCodeSVG
                  value={joinUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Link copiabile */}
            <div className="flex gap-2">
              <input
                type="text"
                value={joinUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 font-mono text-xs text-gray-300 truncate"
              />
              <button
                onClick={copyJoinUrl}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1.5 text-gray-200 text-xs whitespace-nowrap"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copiato!' : 'Copia'}
              </button>
            </div>

            {/* Info */}
            <p className="text-[10px] text-gray-500 text-center mt-3">
              I nuovi giocatori entreranno nella partita con 0 punti
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
