import { createContext, useContext, ReactNode } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';

interface GameSocketContextType {
  socket: ReturnType<typeof useGameSocket>;
}

const GameSocketContext = createContext<GameSocketContextType | null>(null);

export function GameSocketProvider({ 
  children, 
  roomId 
}: { 
  children: ReactNode; 
  roomId: string | null;
}) {
  const socket = useGameSocket(roomId);
  
  return (
    <GameSocketContext.Provider value={{ socket }}>
      {children}
    </GameSocketContext.Provider>
  );
}

export function useGameSocketContext() {
  const context = useContext(GameSocketContext);
  // Restituisci null se il context non è disponibile (es. single player)
  // Questo permette di usare il hook anche quando il provider non è montato
  if (!context) {
    return null;
  }
  return context.socket;
}

