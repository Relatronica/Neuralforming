import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Game } from './components/Game/Game';
import { RoomSetup } from './components/Game/RoomSetup';
import { GameSocketProvider } from './contexts/GameSocketContext';
import { PlayerApp } from './components/PlayerApp/PlayerApp';

type GameMode = 'setup' | 'single' | 'multiplayer';

function MainApp() {
  const [gameMode, setGameMode] = useState<GameMode>('setup');
  const [roomId, setRoomId] = useState<string | null>(null);
  
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Neuralforming</h1>
          <p className="text-gray-600 mb-8">
            Prendi decisioni politiche per un'IA sostenibile e responsabile
          </p>
          <div className="space-y-4">
            <button
              onClick={handleStartSinglePlayer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Gioca Single Player
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">oppure</span>
              </div>
            </div>
            <button
              onClick={() => setGameMode('multiplayer')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Gioca Multiplayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usa un unico provider per tutta la sessione multiplayer per mantenere lo stato condiviso
  // Per single player e setup, non serve il provider
  if (gameMode === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Neuralforming</h1>
          <p className="text-gray-600 mb-8">
            Prendi decisioni politiche per un'IA sostenibile e responsabile
          </p>
          <div className="space-y-4">
            <button
              onClick={handleStartSinglePlayer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Gioca Single Player
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">oppure</span>
              </div>
            </div>
            <button
              onClick={() => setGameMode('multiplayer')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Gioca Multiplayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'single') {
    return (
      <Game
        mode={gameMode}
        roomId={null}
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

