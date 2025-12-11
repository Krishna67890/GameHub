import React, { createContext, useContext, useState } from 'react';

interface GameContextType {
  currentGame: string | null;
  setCurrentGame: (game: string | null) => void;
  gameScore: number;
  setGameScore: (score: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);

  return (
    <GameContext.Provider value={{ currentGame, setCurrentGame, gameScore, setGameScore }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};