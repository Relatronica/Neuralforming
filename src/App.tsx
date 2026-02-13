import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Game } from './components/Game/Game';
import { SinglePlayerGame } from './components/SinglePlayer/SinglePlayerGame';
import { RoomSetup } from './components/Game/RoomSetup';
import { GameSocketProvider } from './contexts/GameSocketContext';
import { PlayerApp } from './components/PlayerApp/PlayerApp';
import { GameGuide } from './components/Game/GameGuide';
import { BookOpen } from 'lucide-react';

type GameMode = 'setup' | 'single' | 'multiplayer';

function MainApp() {
  const [gameMode, setGameMode] = useState<GameMode>('setup');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // Mantieni lo stesso roomId anche quando si naviga, così il context mantiene lo stato
  // IMPORTANTE: usa sempre roomId (anche se null) per mantenere lo stesso provider
  const effectiveRoomId = gameMode === 'multiplayer' ? (roomId || null) : null;

  const handleStartSinglePlayer = () => {
    setGameMode('single');
  };

  const handleStartMultiplayer = (roomId: string) => {
    setRoomId(roomId);
    setGameMode('multiplayer');
  };

  const handleBackToSetup = () => {
    setGameMode('setup');
    setRoomId(null);
  };

  if (gameMode === 'setup') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-700">
            <div className="mb-6 flex justify-center">
              <img 
                src="/images/logo/logo_neuralforming.png" 
                alt="Neuralforming Logo" 
                className="h-82 w-auto object-contain"
              />
            </div>
            <p className="text-gray-300 mb-8 text-lg">
              Governare l'Intelligenza Artificiale
            </p>
            <div className="space-y-4">
              <button
                onClick={handleStartSinglePlayer}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Gioca Single Player
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">oppure</span>
                </div>
              </div>
              <button
                onClick={() => setGameMode('multiplayer')}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Gioca Multiplayer
              </button>
              <div className="pt-4">
                <button
                  onClick={() => setShowGuide(true)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Guida al Gioco
                </button>
              </div>
            </div>
          </div>
        </div>
        {showGuide && <GameGuide onClose={() => setShowGuide(false)} />}
      </>
    );
  }

  if (gameMode === 'single') {
    return (
      <SinglePlayerGame
        onBackToSetup={handleBackToSetup}
      />
    );
  }

  // Multiplayer: usa il provider per condividere lo stato
  return (
    <GameSocketProvider roomId={effectiveRoomId}>
      {!roomId ? (
        <RoomSetup onGameStart={handleStartMultiplayer} />
      ) : (
        <Game
          mode={gameMode}
          roomId={roomId}
          onBackToSetup={handleBackToSetup}
        />
      )}
    </GameSocketProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/player" element={<PlayerApp />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

