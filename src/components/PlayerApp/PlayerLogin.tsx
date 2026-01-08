import React, { useEffect, useState } from 'react';
import { 
  Landmark, 
  Check, 
  Shield, 
  Star, 
  Flame, 
  Zap, 
  Crown, 
  Globe, 
  Flashlight,
  QrCode
} from 'lucide-react';
import { getQueryParam, extractRoomId } from '../../utils/deeplink';
import { QRCodeScanner } from './QRCodeScanner';

interface PlayerLoginProps {
  onLogin: (roomId: string, playerName: string, playerColor: string, playerIcon: string) => void;
}

// Colori disponibili per i partiti
const availableColors = [
  { name: 'Blu', value: '#3b82f6' },
  { name: 'Rosso', value: '#ef4444' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Giallo', value: '#eab308' },
  { name: 'Viola', value: '#a855f7' },
  { name: 'Arancione', value: '#f97316' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Ciano', value: '#06b6d4' },
];

// Icone disponibili per i partiti
const availableIcons = [
  { name: 'Landmark', value: 'landmark', Icon: Landmark },
  { name: 'Scudo', value: 'shield', Icon: Shield },
  { name: 'Stella', value: 'star', Icon: Star },
  { name: 'Fiamma', value: 'flame', Icon: Flame },
  { name: 'Fulmine', value: 'lightning', Icon: Zap },
  { name: 'Corona', value: 'crown', Icon: Crown },
  { name: 'Globo', value: 'globe', Icon: Globe },
  { name: 'Torcia', value: 'torch', Icon: Flashlight },
];

export const PlayerLogin: React.FC<PlayerLoginProps> = ({ onLogin }) => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(availableColors[0].value);
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0].value);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Pre-compila l'ID stanza dai query param, se presente (?room=...)
  useEffect(() => {
    const qp = getQueryParam('room');
    if (qp) {
      setRoomId(qp);
      
      // Se c'è un roomId nel query param diverso da quello salvato, NON pre-compilare il nome
      // perché potrebbe essere già usato nella nuova partita
      try {
        const saved = localStorage.getItem('neuralforming_player_session');
        if (saved) {
          const session = JSON.parse(saved);
          if (session.roomId && session.roomId !== qp) {
            console.log('🔄 QR code roomId differs from saved session, not pre-filling name:', {
              savedRoomId: session.roomId,
              qrRoomId: qp,
            });
            // Non pre-compilare il nome - lascia che l'utente inserisca un nuovo nome
            // per evitare conflitti con nomi già usati nella nuova partita
          } else if (session.roomId === qp && session.playerId) {
            // Solo se il roomId corrisponde, pre-compila il nome (stessa partita)
            setPlayerName(session.playerId);
            setSelectedColor(session.playerColor || availableColors[0].value);
            setSelectedIcon(session.playerIcon || availableIcons[0].value);
          }
        }
      } catch (e) {
        console.error('Failed to check session:', e);
      }
    } else {
      // Se non c'è query param, prova a caricare la sessione salvata
      try {
        const saved = localStorage.getItem('neuralforming_player_session');
        if (saved) {
          const session = JSON.parse(saved);
          if (session.roomId && session.playerId) {
            setRoomId(session.roomId);
            setPlayerName(session.playerId);
            setSelectedColor(session.playerColor || availableColors[0].value);
            setSelectedIcon(session.playerIcon || availableIcons[0].value);
          }
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
  }, []);

  // Ascolta eventi di errore per mostrare messaggio quando il nome è già usato
  useEffect(() => {
    const handlePlayerNameTaken = () => {
      setNameError('Questo nome è già usato in questa partita. Scegli un altro nome.');
      setPlayerName(''); // Pulisci il campo nome
    };

    window.addEventListener('playerNameTaken', handlePlayerNameTaken);

    return () => {
      window.removeEventListener('playerNameTaken', handlePlayerNameTaken);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const extractedRoomId = extractRoomId(roomId);
    if (extractedRoomId && playerName.trim()) {
      onLogin(extractedRoomId, playerName.trim(), selectedColor, selectedIcon);
    }
  };

  const handleQRScanSuccess = (decodedText: string) => {
    console.log('📷📷📷 handleQRScanSuccess called with:', decodedText);
    console.log('📷 Full decoded text:', JSON.stringify(decodedText));
    
    const extractedRoomId = extractRoomId(decodedText);
    console.log('📷 Extracted roomId:', extractedRoomId);
    
    if (extractedRoomId) {
      console.log('✅ Setting roomId to:', extractedRoomId);
      setRoomId(extractedRoomId);
      setShowScanner(false);
      // Focus sul campo nome per permettere all'utente di inserire il nome
      setTimeout(() => {
        const nameInput = document.querySelector('input[type="text"][placeholder*="nome"]') as HTMLInputElement;
        if (nameInput) {
          nameInput.focus();
        }
      }, 100);
    } else {
      console.error('❌ Could not extract roomId from QR code:', decodedText);
      setShowScanner(false);
      // Mostra un messaggio di errore
      setNameError('QR code non valido. Assicurati di scansionare il QR code della partita.');
    }
  };

  const handleNewGame = () => {
    // Pulisci tutto e resetta il form
    setRoomId('');
    setPlayerName('');
    setSelectedColor(availableColors[0].value);
    setSelectedIcon(availableIcons[0].value);
    setNameError(null);
    // Rimuovi anche la sessione salvata
    localStorage.removeItem('neuralforming_player_session');
    console.log('🆕 New game: session cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Landmark className="w-8 h-8 text-gray-100" />
          <h1 className="text-2xl font-bold text-gray-100">Neuralforming</h1>
        </div>
        
        <p className="text-gray-300 text-center mb-6">
          Accedi alla partita con il tuo nome e l'ID della partita
        </p>

        {/* Pulsante Scansiona QR Code */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Scansiona QR Code
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">oppure</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID Partita
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setNameError(null); // Pulisci errori quando l'utente modifica
              }}
              placeholder="Inserisci ID partita o incolla URL completo"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono text-sm text-gray-100 placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome del Partito
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setNameError(null); // Pulisci l'errore quando l'utente inizia a digitare
              }}
              placeholder="Il tuo nome partito"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-100 placeholder-gray-500 ${
                nameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'
              }`}
              maxLength={30}
              required
            />
            {nameError && (
              <p className="mt-2 text-sm text-red-400">{nameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Colore del Partito
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    relative h-12 rounded-lg border-2 transition-all duration-200
                    ${selectedColor === color.value 
                      ? 'border-gray-400 scale-110 shadow-lg' 
                      : 'border-gray-600 hover:border-gray-500 hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icona del Partito
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableIcons.map((iconOption) => {
                const IconComponent = iconOption.Icon;
                return (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => setSelectedIcon(iconOption.value)}
                    className={`
                      h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                      ${selectedIcon === iconOption.value 
                        ? 'border-gray-400 bg-gray-700 scale-110 shadow-lg' 
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700 hover:scale-105'
                      }
                    `}
                    title={iconOption.name}
                  >
                    <IconComponent className="w-6 h-6 text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Accedi alla Partita
          </button>
        </form>

        {/* Pulsante Nuova Partita */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleNewGame}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            🆕 Nuova Partita
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Pulisce la sessione salvata per entrare in una nuova partita
          </p>
        </div>

        {/* Scanner QR Code Overlay */}
        {showScanner && (
          <QRCodeScanner
            onScanSuccess={handleQRScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </div>
  );
};

