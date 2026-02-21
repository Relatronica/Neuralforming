import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Game } from './components/Game/Game';
import { SinglePlayerGame } from './components/SinglePlayer/SinglePlayerGame';
import { RoomSetup } from './components/Game/RoomSetup';
import { GameSocketProvider } from './contexts/GameSocketContext';
import { PlayerApp } from './components/PlayerApp/PlayerApp';
import { LandingPage } from './components/Landing/LandingPage';
import { GuidePage } from './components/Guide/GuidePage';

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
      <LandingPage
        onStartSingle={handleStartSinglePlayer}
        onStartMultiplayer={() => setGameMode('multiplayer')}
      />
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
        <Route path="/guida" element={<GuidePage />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

