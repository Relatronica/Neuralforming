import React, { useState, useEffect } from 'react';
import { GameSocketProvider } from '../../contexts/GameSocketContext';
import { PlayerLogin } from './PlayerLogin';
import { PlayerGame } from './PlayerGame';

/**
 * PWA per i giocatori mobile
 * UI semplificata che mostra solo le azioni che il giocatore può fare:
 * - Votazioni su proposte
 * - Proposte di legge quando è il loro turno
 * - Dilemmi quando è il loro turno
 * - Consegue quando è il loro turno
 */

const STORAGE_KEY = 'neuralforming_player_session';

interface SavedSession {
  roomId: string;
  playerId: string;
  playerColor: string;
  playerIcon: string;
}

export const PlayerApp: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [playerIcon, setPlayerIcon] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Ascolta eventi di errore per resettare il form quando il nome è già usato
  useEffect(() => {
    const handlePlayerNameTaken = () => {
      console.log('🔄 Player name already taken, resetting form...');
      // Resetta tutto per permettere all'utente di inserire un nuovo nome
      setRoomId(null);
      setPlayerId(null);
      setPlayerColor(null);
      setPlayerIcon(null);
      localStorage.removeItem(STORAGE_KEY);
    };

    window.addEventListener('playerNameTaken', handlePlayerNameTaken);

    return () => {
      window.removeEventListener('playerNameTaken', handlePlayerNameTaken);
    };
  }, []);

  // Carica credenziali salvate al mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const session: SavedSession = JSON.parse(saved);
        if (session.roomId && session.playerId) {
          // Verifica se c'è un roomId nel query param (da QR code)
          const queryRoomId = new URLSearchParams(window.location.search).get('room');
          
          // Se c'è un roomId nel query param diverso da quello salvato, non caricare la sessione
          // Questo permette di entrare in una nuova partita senza problemi
          // IMPORTANTE: non pre-compilare il nome perché potrebbe essere già usato nella nuova partita
          if (queryRoomId && queryRoomId !== session.roomId) {
            console.log('🔄 New roomId from QR code detected, clearing old session:', {
              oldRoomId: session.roomId,
              newRoomId: queryRoomId,
            });
            localStorage.removeItem(STORAGE_KEY);
            setIsLoadingSession(false);
            // Non impostare roomId/playerId qui - lascia che l'utente faccia login manualmente
            // Il roomId verrà pre-compilato dal PlayerLogin tramite query param
            return;
          }
          
          console.log('📦 Loading saved session:', { roomId: session.roomId, playerId: session.playerId });
          setRoomId(session.roomId);
          setPlayerId(session.playerId);
          setPlayerColor(session.playerColor || null);
          setPlayerIcon(session.playerIcon || null);
        }
      }
    } catch (e) {
      console.error('❌ Failed to load session from localStorage:', e);
      // Se c'è un errore, pulisci i dati corrotti
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  // Salva credenziali ogni volta che cambiano
  useEffect(() => {
    if (roomId && playerId) {
      const session: SavedSession = {
        roomId,
        playerId,
        playerColor: playerColor || '#3B82F6',
        playerIcon: playerIcon || 'landmark',
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        console.log('💾 Session saved to localStorage');
      } catch (e) {
        console.error('❌ Failed to save session to localStorage:', e);
      }
    } else {
      // Se non ci sono credenziali, rimuovi dalla localStorage
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [roomId, playerId, playerColor, playerIcon]);

  const handleLogin = (room: string, player: string, color: string, icon: string) => {
    // Se il roomId è diverso da quello salvato, pulisci le credenziali vecchie
    // IMPORTANTE: questo assicura che quando si cambia partita, il nome venga resettato
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const session: SavedSession = JSON.parse(saved);
        if (session.roomId && session.roomId !== room) {
          console.log('🔄 New roomId detected in login, clearing old session:', {
            oldRoomId: session.roomId,
            newRoomId: room,
            oldPlayerName: session.playerId,
          });
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('❌ Failed to check old session:', e);
    }
    
    // Imposta le nuove credenziali (verranno salvate automaticamente dal useEffect)
    setRoomId(room);
    setPlayerId(player);
    setPlayerColor(color);
    setPlayerIcon(icon);
  };

  const handleLogout = () => {
    // Pulisci tutto e rimuovi dalla localStorage
    setRoomId(null);
    setPlayerId(null);
    setPlayerColor(null);
    setPlayerIcon(null);
    localStorage.removeItem(STORAGE_KEY);
    console.log('🚪 Logout: session cleared');
  };

  // Mostra loading durante il caricamento della sessione
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-100 mb-2">Caricamento...</h2>
          <p className="text-gray-300">Ripristino sessione...</p>
        </div>
      </div>
    );
  }

  if (!roomId || !playerId) {
    return <PlayerLogin onLogin={handleLogin} />;
  }

  return (
    <GameSocketProvider roomId={roomId}>
      <PlayerGame 
        roomId={roomId} 
        playerId={playerId} 
        playerColor={playerColor || '#3B82F6'}
        playerIcon={playerIcon || 'landmark'}
        onLogout={handleLogout}
      />
    </GameSocketProvider>
  );
};

